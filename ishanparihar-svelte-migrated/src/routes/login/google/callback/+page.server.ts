import { redirect, fail } from "@sveltejs/kit";
import { googleAuth, lucia } from "$lib/server/lucia";
import { Pool } from "pg";
import { env } from "$env/dynamic/private";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, cookies }) => {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = cookies.get("oauth_state");
    const codeVerifier = cookies.get("oauth_code_verifier");

    // Clear cookies
    cookies.delete("oauth_state", { path: "/" });
    cookies.delete("oauth_code_verifier", { path: "/" });

    if (!code || !state || !storedState || !codeVerifier) {
        throw redirect(302, "/login?error=invalid_oauth");
    }

    if (state !== storedState) {
        throw redirect(302, "/login?error=invalid_state");
    }

    try {
        // Validate authorization code
        const googleUser = await googleAuth.validateAuthorizationCode(code, codeVerifier);

        const pool = new Pool({
            connectionString: env.SUPABASE_URL,
        });

        // Check if user exists
        const existingUser = await pool.query(
            'SELECT id, email, role FROM auth.users WHERE email = $1',
            [googleUser.email]
        );

        let userId: string;
        
        if (existingUser.rows.length === 0) {
            // Create new user
            const newUser = await pool.query(
                'INSERT INTO auth.users (email, name, picture, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
                [googleUser.email, googleUser.name, googleUser.picture, 'user']
            );
            userId = newUser.rows[0].id;
        } else {
            userId = existingUser.rows[0].id;
        }

        // Create session
        const session = await lucia.createSession(userId, {
            email: googleUser.email,
            role: existingUser.rows[0]?.role || 'user'
        });
        
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });

        await pool.end();
        throw redirect(302, "/");
    } catch (error) {
        console.error('OAuth callback error:', error);
        throw redirect(302, "/login?error=oauth_failed");
    }
};

import { redirect, fail } from "@sveltejs/kit";
import { googleAuth, auth } from "$lib/server/auth";
import { getSupabase } from "$lib/server/db";
import { generateIdFromEntropySize } from "lucia";

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
        const tokens = await googleAuth.validateAuthorizationCode(code, codeVerifier);

        // Get user info from Google API using the access token
        const googleUserResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`
            }
        });

        if (!googleUserResponse.ok) {
            throw redirect(302, "/login?error=oauth_failed");
        }

        const googleUser = await googleUserResponse.json();

        // Check if user exists in our database
        const { data: existingUser, error: fetchError } = await getSupabase()
            .from('users')
            .select('id, email, role')
            .eq('email', googleUser.email)
            .single();

        let userId: string;
        
        if (!existingUser) {
            // Create new user
            const newUserId = generateIdFromEntropySize(15);
            const { error: insertError } = await getSupabase()
                .from('users')
                .insert({
                    id: newUserId,
                    email: googleUser.email,
                    name: googleUser.name,
                    picture: googleUser.picture,
                    role: 'user'
                });

            if (insertError) {
                console.error('Error creating user:', insertError);
                throw redirect(302, "/login?error=oauth_failed");
            }
            
            userId = newUserId;
        } else {
            userId = existingUser.id;
        }

        // Create session
        const session = await auth.createSession(userId, {});
        const sessionCookie = auth.createSessionCookie(session.id);
        cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });

        throw redirect(302, "/");
    } catch (error) {
        console.error('OAuth callback error:', error);
        throw redirect(302, "/login?error=oauth_failed");
    }
};

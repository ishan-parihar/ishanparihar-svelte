import { fail, redirect } from "@sveltejs/kit";
import { lucia } from "$lib/server/lucia";
import { compare } from "bcrypt";
import { Pool } from "pg";
import { env } from "$env/dynamic/private";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) {
        return redirect(302, "/");
    }
};

export const actions: Actions = {
    default: async (event) => {
        const formData = await event.request.formData();
        const email = formData.get("email");
        const password = formData.get("password");

        if (typeof email !== "string" || email.length < 3 || !email.includes("@")) {
            return fail(400, { message: "Invalid email" });
        }
        if (typeof password !== "string" || password.length < 6) {
            return fail(400, { message: "Password too short" });
        }

        try {
            const pool = new Pool({
                connectionString: env.SUPABASE_URL,
            });

            // Query users table directly
            const result = await pool.query(
                'SELECT id, email, password, role FROM auth.users WHERE email = $1',
                [email.toLowerCase()]
            );

            if (result.rows.length === 0) {
                return fail(400, { message: "Incorrect email or password" });
            }

            const user = result.rows[0];
            const validPassword = await compare(password, user.password);

            if (!validPassword) {
                return fail(400, { message: "Incorrect email or password" });
            }

            // Create session using lucia
            const session = await lucia.createSession(user.id, {
                email: user.email,
                role: user.role
            });
            
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });

            await pool.end();
            return redirect(302, "/");
        } catch (error) {
            console.error('Login error:', error);
            return fail(500, { message: "An error occurred during login" });
        }
    }
};

import { fail, redirect } from "@sveltejs/kit";
import { auth as lucia } from "$lib/server/auth";
import { compare } from "bcrypt";
import { getSupabase } from "$lib/server/db";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.auth?.user) {
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
            // Query users table directly using Supabase
            const { data: user, error } = await getSupabase()
                .from('users')
                .select('id, email, password_hash, role')
                .eq('email', email.toLowerCase())
                .single();

            if (error || !user) {
                return fail(400, { message: "Incorrect email or password" });
            }

            // Compare the password using bcrypt
            const validPassword = await compare(password, user.password_hash);

            if (!validPassword) {
                return fail(400, { message: "Incorrect email or password" });
            }

            // Create session using lucia
            const session = await lucia.createSession(user.id, {});
            
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });

            return redirect(302, "/");
        } catch (error) {
            console.error('Login error:', error);
            return fail(500, { message: "An error occurred during login" });
        }
    }
};

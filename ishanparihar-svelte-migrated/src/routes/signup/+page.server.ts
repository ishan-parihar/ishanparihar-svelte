
import { auth as lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { generateIdFromEntropySize } from "lucia";
import { hash } from "bcrypt";
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

        const userId = generateIdFromEntropySize(15);
        const passwordHash = await hash(password, 10);

        try {
            // Create user in Supabase
            const { error: userError } = await getSupabase()
                .from('users')
                .insert({
                    id: userId,
                    email,
                    password_hash: passwordHash,
                    role: "user",
                    name: email.split("@")[0] // Use part of email as name
                });

            if (userError) {
                // Check if it's a duplicate email error
                if (userError.code === '23505') { // Unique violation code in PostgreSQL/Supabase
                    return fail(400, { message: "Email already used" });
                }
                throw userError;
            }
        } catch (e) {
            console.error("Signup error:", e);
            return fail(400, { message: "An error occurred during signup" });
        }

        // Create session for the user
        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });

        return redirect(302, "/");
    }
};


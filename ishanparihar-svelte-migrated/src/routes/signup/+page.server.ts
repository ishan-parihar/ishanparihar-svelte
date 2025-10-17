
import { auth as lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { generateId } from "lucia";
import { hash } from "bcrypt";

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

        const userId = generateId(15);
        const passwordHash = await hash(password, 10);

        try {
            await lucia.createUser({
                id: userId,
                attributes: {
                    email,
                    role: "user"
                }
            });

            await lucia.createKey("email", email, {
                userId,
                password: passwordHash
            });
        } catch (e) {
            // this part depends on the database you're using
            // check for unique constraint error in user table
            return fail(400, { message: "Email already used" });
        }

        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });

        return redirect(302, "/");
    }
};



import { lucia } from "$lib/server/lucia";
import { fail, redirect } from "@sveltejs/kit";
import { verify } from "@node-rs/argon2";
import { pg } from "@lucia-auth/adapter-postgresql";
import { Pool } from "pg";
import { env } from "$env/dynamic/private";

import type { Actions, PageServerLoad } from "./$types";
import { compare } from "bcrypt";

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

        const pool = new Pool({
            connectionString: env.SUPABASE_URL,
        });

        const db = pg(pool, {
            user: "auth.users",
            session: "auth.sessions",
            key: "auth.keys",
        });

        const key = await db.getKey("email", email);
        if (!key) {
            return fail(400, { message: "Incorrect email or password" });
        }

        const validPassword = await compare(password, key.hashedPassword!);
        if (!validPassword) {
            return fail(400, { message: "Incorrect email or password" });
        }

        const session = await lucia.createSession(key.userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });

        return redirect(302, "/");
    }
};

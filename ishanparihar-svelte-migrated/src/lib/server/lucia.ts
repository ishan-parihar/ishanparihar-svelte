
import { Lucia } from "lucia";
import { dev } from "$app/environment";
import { pg } from "@lucia-auth/adapter-postgresql";
import { Pool } from "pg";
import { env } from "$env/dynamic/private";

const pool = new Pool({
    connectionString: env.SUPABASE_URL,
});

export const adapter = pg(pool, {
    user: "auth.users",
    session: "auth.sessions",
    key: "auth.keys",
});


export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: !dev
        }
    },
    getUserAttributes: (attributes) => {
        return {
            email: attributes.email,
            role: attributes.role
        };
    }
});

import { google } from "@lucia-auth/oauth/providers";

export const googleAuth = google(lucia, {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: {
            email: string;
            role: string;
        };
    }
}

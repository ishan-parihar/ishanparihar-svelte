import { Lucia } from "lucia";
import { dev } from "$app/environment";
// import postgres from "@lucia-auth/adapter-postgresql";
import { Pool } from "pg";
import { env } from "$env/dynamic/private";
import { Google } from "arctic";

const pool = new Pool({
    connectionString: env.SUPABASE_URL,
});

// Temporary mock adapter for build - will be replaced with proper adapter
export const adapter = {
    getUser: async (userId: string) => {
        const result = await pool.query(
            'SELECT id, email, role FROM auth.users WHERE id = $1',
            [userId]
        );
        return result.rows[0] || null;
    },
    getSession: async (sessionId: string) => {
        const result = await pool.query(
            'SELECT id, user_id, expires_at FROM auth.sessions WHERE id = $1 AND expires_at > NOW()',
            [sessionId]
        );
        return result.rows[0] || null;
    },
    createSession: async (sessionData: any) => {
        const result = await pool.query(
            'INSERT INTO auth.sessions (id, user_id, expires_at) VALUES ($1, $2, $3) RETURNING *',
            [sessionData.id, sessionData.userId, sessionData.expiresAt]
        );
        return result.rows[0];
    },
    deleteSession: async (sessionId: string) => {
        await pool.query('DELETE FROM auth.sessions WHERE id = $1', [sessionId]);
    }
} as any;

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

export const google = new Google(
    env.GOOGLE_CLIENT_ID!,
    env.GOOGLE_CLIENT_SECRET!,
    env.GOOGLE_REDIRECT_URI!
);

export const googleAuth = {
    createAuthorizationURL: (state: string, codeVerifier: string) => {
        return google.createAuthorizationURL(state, codeVerifier);
    },
    validateAuthorizationCode: async (code: string, codeVerifier: string) => {
        const tokens = await google.validateAuthorizationCode(code, codeVerifier);
        const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken()}`,
            },
        });
        const user = await response.json();
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture
        };
    }
};

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: {
            email: string;
            role: string;
        };
    }
}

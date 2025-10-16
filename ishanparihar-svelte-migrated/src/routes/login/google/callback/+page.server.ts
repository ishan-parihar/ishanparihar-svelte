
import { googleAuth, lucia } from "$lib/server/lucia";
import { OAuth2RequestError } from "lucia";
import { generateId } from "lucia";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies, url }) => {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = cookies.get("google_oauth_state");
    const codeVerifier = cookies.get("google_oauth_code_verifier");

    if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
        return new Response(null, {
            status: 400
        });
    }

    try {
        const tokens = await googleAuth.validateAuthorizationCode(code, codeVerifier);
        const googleUserResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`
            }
        });
        const googleUser = await googleUserResponse.json();

        const existingUser = await lucia.getUser(googleUser.sub, "google");

        if (existingUser) {
            const session = await lucia.createSession(existingUser.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            return new Response(null, {
                status: 302,
                headers: {
                    Location: "/",
                    "Set-Cookie": sessionCookie.serialize()
                }
            });
        }

        const userId = generateId(15);
        await lucia.createUser({
            id: userId,
            attributes: {
                email: googleUser.email,
                role: "user"
            }
        });
        await lucia.createKey("google", googleUser.sub, {
            userId
        });

        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/",
                "Set-Cookie": sessionCookie.serialize()
            }
        });
    } catch (e) {
        if (e instanceof OAuth2RequestError) {
            return new Response(null, {
                status: 400
            });
        }
        return new Response(null, {
            status: 500
        });
    }
};

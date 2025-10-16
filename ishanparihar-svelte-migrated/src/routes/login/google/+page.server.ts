
import { redirect } from "@sveltejs/kit";
import { generateCodeVerifier, generateState } from "lucia";
import { googleAuth } from "$lib/server/lucia";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies }) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    cookies.set("google_oauth_state", state, {
        path: "/",
        secure: import.meta.env.PROD,
        httpOnly: true,
        maxAge: 60 * 60
    });
    cookies.set("google_oauth_code_verifier", codeVerifier, {
        path: "/",
        secure: import.meta.env.PROD,
        httpOnly: true,
        maxAge: 60 * 60
    });
    const authUrl = await googleAuth.getAuthorizationUrl(state, codeVerifier, {
        scopes: ["profile", "email"]
    });
    return redirect(302, authUrl.toString());
};

import { redirect } from "@sveltejs/kit";
import { googleAuth } from "$lib/server/auth";
import { randomBytes } from "node:crypto";

import type { PageServerLoad } from "./$types";

function generateRandomString(length: number): string {
    return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

export const load: PageServerLoad = async ({ cookies }) => {
    const state = generateRandomString(16);
    const codeVerifier = generateRandomString(128);
    
    // Store state and code verifier in cookies for verification
    cookies.set('oauth_state', state, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 10 // 10 minutes
    });
    
    cookies.set('oauth_code_verifier', codeVerifier, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 10 // 10 minutes
    });

    const url = googleAuth.createAuthorizationURL(state, codeVerifier);
    throw redirect(302, url.toString());
};

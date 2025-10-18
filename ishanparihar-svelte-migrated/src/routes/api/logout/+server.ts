
import { auth as lucia } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";

import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
    const sessionId = event.cookies.get(lucia.sessionCookieName);
    if (!sessionId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    await lucia.invalidateSession(sessionId);
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
    });
    return redirect(302, "/login");
};

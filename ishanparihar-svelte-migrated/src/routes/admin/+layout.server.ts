
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user) {
        return redirect(302, "/login");
    }
    if (locals.user.role !== "admin") {
        return redirect(302, "/");
    }
    return {
        user: locals.user
    };
};

// Re-export from the new auth system for backward compatibility
export { auth as lucia } from './auth';
export { googleAuth as google } from './auth';

// Maintain the same type definitions for compatibility
declare module "lucia" {
    interface Register {
        Lucia: typeof import('./auth').auth;
        DatabaseUserAttributes: {
            id: string;
            email: string;
            name: string;
            role: string;
            email_verified: boolean;
            picture: string;
            permissions: string[];
        };
    }
}

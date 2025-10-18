declare global {
  namespace App {
    interface Locals {
      auth: {
        session: import('$lib/server/auth').Session | null;
        user: import('$lib/server/auth').User | null;
      };
    }
  }
}
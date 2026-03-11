type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
type Session = import("@/server/auth/lucia").AppSession;
type User = import("@/types/app").User;

declare namespace App {
	interface Locals extends Runtime {
		user: User | null;
		session: Session | null;
		isAuthenticated: boolean;
	}
}

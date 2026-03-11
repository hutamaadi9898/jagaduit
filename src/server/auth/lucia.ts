import { Lucia, Scrypt, TimeSpan, type Session, type User } from "lucia";

import { createD1Adapter } from "@/server/auth/adapter";

declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof createLucia>;
    DatabaseUserAttributes: {
      email: string;
      displayName: string;
      locale: string;
      currency: string;
      timezone: string;
      onboardingCompletedAt: number | null;
      createdAt: number;
      updatedAt: number;
    };
  }
}

export function createLucia(db: D1Database) {
  return new Lucia(createD1Adapter(db), {
    sessionExpiresIn: new TimeSpan(30, "d"),
    sessionCookie: {
      attributes: {
        secure: import.meta.env.PROD,
        sameSite: "lax",
        path: "/"
      }
    },
    getUserAttributes: (attributes) => ({
      email: attributes.email,
      displayName: attributes.displayName,
      locale: attributes.locale,
      currency: attributes.currency,
      timezone: attributes.timezone,
      onboardingCompletedAt: attributes.onboardingCompletedAt,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt
    })
  });
}

export const passwordHasher = new Scrypt();

export type AppSession = Session;
export type AppAuthUser = User;

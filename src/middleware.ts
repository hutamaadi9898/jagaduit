import { defineMiddleware } from "astro:middleware";

import { createLucia } from "@/server/auth/lucia";
import { getDb } from "@/server/db/client";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = null;
  context.locals.session = null;
  context.locals.isAuthenticated = false;

  const db = getDb(context.locals);
  const auth = createLucia(db);
  const sessionId = auth.readSessionCookie(context.request.headers.get("cookie") ?? "");

  if (!sessionId) {
    return next();
  }

  const result = await auth.validateSession(sessionId);

  if (result.session && result.session.fresh) {
    const sessionCookie = auth.createSessionCookie(result.session.id);
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }

  if (!result.session) {
    const sessionCookie = auth.createBlankSessionCookie();
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return next();
  }

  context.locals.session = result.session;
  context.locals.user = {
    id: result.user.id,
    email: result.user.email,
    displayName: result.user.displayName,
    locale: result.user.locale,
    currency: result.user.currency,
    timezone: result.user.timezone,
    onboardingCompletedAt: result.user.onboardingCompletedAt,
    createdAt: result.user.createdAt,
    updatedAt: result.user.updatedAt
  };
  context.locals.isAuthenticated = true;

  const { pathname } = new URL(context.request.url);
  const isAppRoute = pathname.startsWith("/app");
  const isOnboardingRoute = pathname === "/app/onboarding";
  const isApiRoute = pathname.startsWith("/api/");
  const needsOnboarding = !context.locals.user.onboardingCompletedAt;

  if (!isApiRoute && context.request.method === "GET") {
    if (needsOnboarding && isAppRoute && !isOnboardingRoute) {
      return context.redirect("/app/onboarding");
    }

    if (!needsOnboarding && isOnboardingRoute) {
      return context.redirect("/app");
    }
  }

  return next();
});

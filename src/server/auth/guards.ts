export function requireAuth(locals: App.Locals) {
  if (!locals.isAuthenticated || !locals.user) {
    throw new Response(null, {
      status: 302,
      headers: {
        Location: "/login"
      }
    });
  }

  return locals.user;
}

export function requireGuest(locals: App.Locals) {
  if (locals.isAuthenticated) {
    throw new Response(null, {
      status: 302,
      headers: {
        Location: "/app"
      }
    });
  }
}

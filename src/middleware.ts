import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  redirectUri: process.env.WORKOS_REDIRECT_URI || "http://localhost:4444/auth/callback",
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ["/", "/auth/callback", "/auth/signout"],
  },
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logos/).*)",
  ],
};

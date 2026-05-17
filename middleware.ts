// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login", // Куда отправлять неавторизованных пользователей
  },
});

export const config = {
  // Защищаем все роуты внутри /admin, кроме самой страницы логина
  matcher: ["/admin/dashboard/:path*", "/admin/analytics/:path*"],
};

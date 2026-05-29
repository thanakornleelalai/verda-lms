import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["th", "en"],
  defaultLocale: "th",
  pathnames: {
    "/": "/",
    "/search": "/search",
    "/courses": "/courses",
    "/courses/[slug]": "/courses/[slug]",
    "/login": "/login",
    "/signup": "/signup",
    "/dashboard": "/dashboard",
    "/certificate/[uuid]": "/certificate/[uuid]",
    "/checkout": "/checkout",
    "/studio": "/studio",
  },
});

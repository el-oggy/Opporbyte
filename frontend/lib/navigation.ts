/** Permit only local private-workspace destinations after sign-in. */
export function workspaceDestination(value: string | null | undefined): string {
  if (!value || /[\\\u0000-\u0020]/.test(value)) return "/app";
  try {
    const url = new URL(value, "http://opporbyte.local");
    if (
      url.origin !== "http://opporbyte.local" ||
      !value.startsWith("/") ||
      !(url.pathname === "/app" || url.pathname.startsWith("/app/"))
    )
      return "/app";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/app";
  }
}

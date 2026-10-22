declare module '#app' {
  interface PageMeta {
    /** Reachable without signing in. */
    public?: boolean
    /** Only for signed-out visitors (login, register…); signed-in users go to the dashboard. */
    guestOnly?: boolean
  }
}

export {}

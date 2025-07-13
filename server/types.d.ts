declare module "express-session" {
  interface SessionStore {
    [key: string]: any;
  }
}

declare module "vite" {
  interface ServerOptions {
    allowedHosts?: true | string[] | undefined;
  }
}
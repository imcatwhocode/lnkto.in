declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HTTP_BIND_PORT?: string;
      HTTP_BIND_HOST?: string;
      HTTP_BIND_IPC?: string;
    }
  }
}

export {};

declare namespace NodeJS {
  interface ProcessEnv {
    HASH_KEY: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    NODE_ENV: string;
    SERVER_PORT: 8081,
  }
}
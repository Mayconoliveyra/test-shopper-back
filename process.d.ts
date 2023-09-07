declare namespace NodeJS {
  export interface ProcessEnv {
    SERVER_PORT: number;

    DATABASE_HOST: string;
    DATABASE_USER: string;
    DATABASE_NAME: string;
    DATABASE_PORT: number;
    DATABASE_PASSWORD: string;
  }
}

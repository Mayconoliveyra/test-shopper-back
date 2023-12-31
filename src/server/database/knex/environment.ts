import { Knex } from "knex";
import path from "path";

export const development: Knex.Config = {
  client: "mysql2",
  migrations: {
    directory: path.resolve(__dirname, "..", "migrations"),
  },
  connection: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    decimalNumbers: true, // Essa opção faz com que os decimais sejam retornados como números
    dateStrings: true, // Essa opção faz com que os dataTime sejam retornados como string
    typeCast: function (field: any, next: any) {
      if (field.type == "TINY" && field.length == 1) {
        return field.string() == "1"; // 1 = true, 0 = false
      }
      return next();
    },
  },
};

export const test: Knex.Config = {
  client: "mysql2",
  migrations: {
    directory: path.resolve(__dirname, "..", "migrations"),
  },
  connection: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    database: "test-shopper",
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    decimalNumbers: true, // Essa opção faz com que os decimais sejam retornados como números
    dateStrings: true, // Essa opção faz com que os dataTime sejam retornados como string
    typeCast: function (field: any, next: any) {
      if (field.type == "TINY" && field.length == 1) {
        return field.string() == "1"; // 1 = true, 0 = false
      }
      return next();
    },
  },
};

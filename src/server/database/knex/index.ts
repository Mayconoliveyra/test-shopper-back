import "dotenv/config";
import { knex } from "knex";

import { development, test } from "./environment";

const getEnvironment = () => {
  switch (process.env.NODE_ENV) {
    case "test":
      return test;

    default:
      return development;
  }
};

export const Knex = knex(getEnvironment());

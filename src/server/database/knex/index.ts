import "dotenv/config";
import { knex } from "knex";

import { development } from "./environment";

export const Knex = knex(development);

import knex from "knex";
import { config } from "./knexfile.js";

const environment = "development";

export const database = knex(config[environment]);

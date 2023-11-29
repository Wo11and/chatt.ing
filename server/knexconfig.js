import knex from "knex";
import { config } from "./knexfile";

const environment = "development";

export const database = knex(config[environment]);

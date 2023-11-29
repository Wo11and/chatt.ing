import { database } from "./knexconfig.js";

const migrations = {
    directory: "./migrations",
};

export const development = { database, migrations: migrations };

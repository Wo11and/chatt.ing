import "dotenv/config";

// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export const config = {
	development: {
		client: "postgres",
		connection: {
			host: process.env.DB_HOST,
			port: process.env.DB_PORT,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		},
		migrations: {
			directory: "./migrations",
		},
	},
};

export default config;

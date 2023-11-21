import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_DB_URI;

export const mongoDbClient = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

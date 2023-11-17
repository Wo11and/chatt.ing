import express from "express";
import cors from "cors";

import "dotenv/config";
import { database } from "./knexconfig.js";

const app = express();
const port = process.env.SERVER_PORT;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
	res.send({ message: "Hello World!" });
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});

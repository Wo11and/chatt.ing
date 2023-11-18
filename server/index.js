import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "node:http";
import "dotenv/config";

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_ADRESS,
	},
});

const port = process.env.SERVER_PORT;

app.use(express.json());

app.get("/", (req, res) => {
	res.send({ message: "Hello World!" });
});

server.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});

io.on("connection", (socket) => {
	console.log("a user connected");
});

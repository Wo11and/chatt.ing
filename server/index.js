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
	console.log("a user connected", socket.handshake.auth);
});

// verify the jwt token upon connecting
// io.use(/*function that gets executed for every incoming socket*/)
//
// io.use((socket, next) => {
// 	const user = verify jwt token
// 	if (!username) {
// 	  return next(new Error("invalid username"));
// 	}
// 	socket.username = user.username;
// 	next();
//   });

// [
// 	{
// 		userId: 3,
// 		socketId: 34,
// 		username: asdf
// 	}
// ]
const activeUsers = [];

io.on("connection", (socket) => {
	socket.emit("users", activeUsers);
	const newEntry = {
		userId: socket.handshake.auth.id,
		username: socket.handshake.auth.name,
		socketId: socket.id,
	};
	activeUsers.push(newEntry);

	socket.broadcast.emit("users", activeUsers);
});

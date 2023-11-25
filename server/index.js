import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "node:http";
import "dotenv/config";
import { AuthenticationService } from "./services/authenticate.js";
import { mongoDbClient } from "./mongodbconfig.js";
import { messageService } from "./services/MessageService.js";

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_ADRESS,
	},
});

const port = process.env.SERVER_PORT;
const auth = new AuthenticationService();

app.use(express.json());

app.post("/login", auth.loginMiddleware);

app.post("/register", auth.loginMiddleware);

//check token fore every http request to the backend below this line
app.use(auth.checkTokenMiddleware);

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
let activeUsers = [];

io.on("connection", (socket) => {
	socket.emit("users", activeUsers);
	const newEntry = {
		userId: socket.handshake.auth.id,
		username: socket.handshake.auth.name,
		socketId: socket.id,
	};
	activeUsers.push(newEntry);
	socket.broadcast.emit("users", activeUsers);
	socket.on("disconnect", () => {
		activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
		socket.broadcast.emit("users", activeUsers);
	});

	socket.on("private message", async (message) => {
		const id = message.to.id;
		const user = activeUsers.find((user) => id === user.userId);

		if (!user) {
			return;
		}

		const socketId = user.socketId;

		messageService.save(message);

		socket.to(socketId).emit("private message", message);
	});

	socket.on("get chat", async (id1, id2) => {
		const result = await messageService.getConversation(id1, id2);
		socket.emit("get chat", result);
	});
});

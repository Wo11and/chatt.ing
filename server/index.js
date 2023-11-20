import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "node:http";
import "dotenv/config";
import { AuthenticationService } from "./services/authenticate.js";


const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_ADRESS,
	},
});

const port = process.env.SERVER_PORT;
const auth = new AuthenticationService;

app.use(express.json());

app.get("/", (req, res) => {
	res.sendFile('/home/kaisiq/Programming/chatt.ing/frontend/index.html');
});


app.post("/login", (req,res,next) => {
	auth.loginMiddleware(req,res,next);
});


app.post("/register", (req,res,next) => {
	auth.registerMiddleware(req,res,next)
});


io.on('connection', function(socket){
	console.log('user connected');
	socket.on('chat message', function(msg){
	  io.emit('chat message', msg);
	});
	socket.on('disconnect', function(){
	  console.log('user disconnected');
	});
});


app.listen(port, () => {
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
});

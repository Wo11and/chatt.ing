import express from "express";
import cors from "cors";
import {Server} from "socket.io";
import "dotenv/config";
import { AuthenticationService } from "./services/authenticate.js";


const app = express();
const port = process.env.SERVER_PORT;
const io = new Server(5000);
const auth = new AuthenticationService;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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

import { io } from "socket.io-client";
import { localStorageSevice } from "./services/LocalStorageSevice";

const activeUsersColumn = document.getElementById("activeUsers");
const userCardTemplate = document.querySelector("#userCardTemplate");
const chatInfo = document.querySelector("#chatInfo");
const sendButton = document.querySelector("#sendButton");
const messageBox = document.querySelector("#messageBox");

let reciever = undefined;

sendButton.addEventListener("click", (e) => {
	e.preventDefault();
	if (!reciever) {
		return;
	}

	const currentMessage = messageBox.value;
	if (!currentMessage) {
		return;
	}

	const message = {
		from: tempAuth.name, // TODO: Add token
		to: reciever.id,
		message: currentMessage,
	};

	console.log(message);
});

const socket = io(import.meta.env.VITE_SERVER_ADRESS, {
	autoConnect: false,
});

const token = localStorage.getItem("token");

//  TODO: Actually authenticate the user
// fetch("http://localhost:3000/", {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// 	.then((response) => response.json())
// 	.then((data) => console.log(data))
// 	.catch((error) => console.error("Error:", error));

// TODO: Authenticate user and get jwtToken
// socket.auth = { token };
// socket.connect();

const tempAuth = JSON.parse(new localStorageSevice("chatting_user").get());

socket.auth = { name: tempAuth.name, id: tempAuth.id };
socket.connect();

// logging every event sent to socket for debugging purposes
socket.onAny((event, ...args) => {
	console.log(event, args);
});

socket.on("users", (users) => {
	activeUsersColumn.innerHTML = "";

	users.forEach((user) => {
		if (user.userId === tempAuth.id) {
			return;
		}

		const clone = userCardTemplate.content.cloneNode(true);
		let cardContent = clone.querySelectorAll("span");
		cardContent[0].textContent = user.username;
		console.log(clone);

		const cardWrapper = clone.querySelector("div");
		cardWrapper.addEventListener("click", (e) => {
			const id = user.userId;
			const username = user.username;
			reciever = { id, username };
			chatInfo.innerHTML = "";
			chatInfo.textContent = `Chat with ${username}`;
		});

		activeUsersColumn.appendChild(clone);
	});
});

// socket.on("connect_error", (err) => {
//     if (err.message === "invalid credetials") {
//  error handling
//     }
//   });

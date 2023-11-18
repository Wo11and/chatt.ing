import { io } from "socket.io-client";
import { localStorageSevice } from "./services/LocalStorageSevice";

const activeUsersColumn = document.getElementById("activeUsers");
const userCardTemplate = document.querySelector("#userCardTemplate");

const socket = io(import.meta.env.VITE_SERVER_ADRESS, {
	autoConnect: false,
});

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
		activeUsersColumn.appendChild(clone);
	});
});

// socket.on("connect_error", (err) => {
//     if (err.message === "invalid credetials") {
//  error handling
//     }
//   });

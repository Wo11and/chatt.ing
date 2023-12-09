import { io } from "socket.io-client";
import { localStorageSevice } from "./services/LocalStorageSevice";

const activeUsersColumn = document.getElementById("activeUsers");
const userCardTemplate = document.querySelector("#userCardTemplate");
const chatInfo = document.querySelector("#chatInfo");
const sendButton = document.querySelector("#sendButton");
const messageBox = document.querySelector("#messageBox");
const chatCanvas = document.querySelector("#chatCanvas");
const messageTemplate = document.querySelector("#messageTemplate");

let reciever = undefined;

const socket = io(import.meta.env.VITE_SERVER_ADRESS, {
    autoConnect: false,
});

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
        from: { username: credentials.name, id: credentials.id }, // TODO: Add token
        to: { username: reciever.username, id: reciever.id },
        content: currentMessage,
        createdAt: new Date(),
    };

    console.log(message);
    socket.emit("private message", message);
    displayMessage(message, { incoming: false });
});

const credentials = JSON.parse(new localStorageSevice("chatting_user").get());

socket.auth = { name: credentials.name, id: credentials.id };
socket.connect();

// logging every event sent to socket for debugging purposes
socket.onAny((event, ...args) => {
    console.log(event, args);
});

socket.on("users", (users) => {
    activeUsersColumn.innerHTML = "";

    users.forEach((user) => {
        if (user.userId === credentials.id) {
            return;
        }

        const clone = userCardTemplate.content.cloneNode(true);
        let cardContent = clone.querySelectorAll("span");
        cardContent[0].textContent = user.username;
        console.log(clone);

        const cardWrapper = clone.querySelector("div");
        cardWrapper.addEventListener("click", () => {
            const id = user.userId;
            const username = user.username;
            reciever = { id, username };
            chatInfo.innerHTML = "";
            chatInfo.textContent = `Chat with ${username}`;

            socket.emit("get chat", id, credentials.id);
        });

        activeUsersColumn.appendChild(clone);
    });
});

socket.on("private message", (message) => {
    if (reciever && message.from.id === reciever.id) {
        displayMessage(message, { incoming: true });
    }
});

socket.on("get chat", (messages) => {
    chatCanvas.innerHTML = "";
    for (let i = messages.length - 1; i >= 0; i--) {
        displayMessage(messages[i], {
            incoming: messages[i].to.id === credentials.id,
        });
    }
});
// socket.on("connect_error", (err) => {
//     if (err.message === "invalid credetials") {
//  error handling
//     }
//   });

function displayMessage(message, options) {
    const clone = messageTemplate.content.cloneNode(true);
    let cardContent = clone.querySelector(".message");
    cardContent.classList.add(options.incoming ? "incoming" : "outgoing");
    cardContent.textContent = message.content;
    chatCanvas.appendChild(clone);
}

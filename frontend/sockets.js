import { io } from "socket.io-client";
import { localStorageSevice } from "./services/LocalStorageSevice";
import { decryptionService } from "./services/decryptionService";

const activeUsersColumn = document.getElementById("activeUsers");
const userCardTemplate = document.querySelector("#userCardTemplate");
const chatInfo = document.querySelector("#chatInfo");
const sendButton = document.querySelector("#sendButton");
const messageBox = document.querySelector("#messageBox");
const chatCanvas = document.querySelector("#chatCanvas");
const messageTemplate = document.querySelector("#messageTemplate");
const addButton = document.querySelector("#plus");

let reciever = undefined;
let currentPage = undefined;

const credentials = JSON.parse(new localStorageSevice("chatting_user").get());
const token = JSON.parse(new localStorageSevice("token").get());
const decryption = new decryptionService();

if (!credentials) {
    window.location.href = `/login.html`;
}

const socket = io(import.meta.env.VITE_SERVER_ADRESS, {
    autoConnect: false,
});

sendButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (!reciever) {
        return;
    }

    const currentMessage = messageBox.value;
    if (!currentMessage && !file) {
        return;
    }

    if (currentMessage) {
        const message = {
            from: { username: credentials.name, id: credentials.id }, // TODO: Add token
            to: { username: reciever.username, id: reciever.id },
            content: currentMessage,
            createdAt: new Date(),
            token,
        };
        socket.emit("new private message", message);

        displayMessage(message, { incoming: false, bottom: true });
    }

    if (file) {
        // console.log(file);
        const reader = new FileReader();
        let encodedPicture;
        reader.onload = function () {
            encodedPicture = reader.result
                .replace("data:", "")
                .replace(/^.+,/, "");

            const pictureMessage = {
                from: { username: credentials.name, id: credentials.id }, // TODO: Add token
                to: { username: reciever.username, id: reciever.id },
                content: encodedPicture,
                type: "picture",
                createdAt: new Date(),
                token,
            };
            console.log(pictureMessage);
            socket.emit("new private message", pictureMessage);
            displayMessage(pictureMessage, { incoming: false, bottom: true });
            file = undefined;
        };

        reader.readAsDataURL(file);
    }
});

socket.auth = { name: credentials.name, id: credentials.id, token };
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
            currentPage = 1;
            const id = user.userId;
            const username = user.username;
            reciever = { id, username };

            const chatData = [id, credentials.id, token];

            chatInfo.innerHTML = "";
            chatInfo.textContent = `Chat with ${username}`;

            chatCanvas.innerHTML = "";
            const getMoreMessagesButton = document.createElement("button");
            getMoreMessagesButton.type = "button";
            getMoreMessagesButton.className = "getMoreMessagesButton";
            getMoreMessagesButton.textContent = "Load more messages";
            getMoreMessagesButton.addEventListener("click", () => {
                socket.emit("get chat", ...chatData, currentPage++);
            });

            chatCanvas.appendChild(getMoreMessagesButton);

            socket.emit("get chat", ...chatData, currentPage++);
        });

        activeUsersColumn.appendChild(clone);
    });
});

socket.on("private message", async (message) => {
    if (reciever && message.from.id === reciever.id) {
        const decryptedMessage =
            message.type === "picture"
                ? message
                : await decryption.decrypt(
                      message.content,
                      message.to.username
                  );
        displayMessage(decryptedMessage, { incoming: true, bottom: true });
    }
});

socket.on("get chat", (messages) => {
    messages.forEach((message) => {
        displayMessage(message, {
            incoming: message.to.id === credentials.id,
            bottom: false,
        });
    });
});

function displayMessage(message, options) {
    const clone = messageTemplate.content.cloneNode(true);
    let cardContent = clone.querySelector(".message");
    cardContent.classList.add(options.incoming ? "incoming" : "outgoing");
    cardContent.innerHTML =
        message.type === "picture"
            ? `<img src="data:image/png;base64,${message.content}" />`
            : `<span>${message.content}</span>`;

    const getMoreMessagesButton = document.getElementsByClassName(
        "getMoreMessagesButton"
    )[0];

    options.bottom
        ? chatCanvas.appendChild(clone)
        : getMoreMessagesButton.after(clone);
}

let file = undefined;

addButton.addEventListener("change", (e) => {
    file = e.target.files[0];
});

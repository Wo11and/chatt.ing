import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "node:http";
import "dotenv/config";
import { AuthenticationService } from "./services/authenticate.js";
import { messageService } from "./services/MessageService.js";
import { TokenService } from "./services/TokenService.js";
import { EncryptionService } from "./services/EncryptionService.js";
import { EncryptionKeysService } from "./services/EncryptionKeysService.js";

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_ADRESS,
    },
    // maxHttpBufferSize: 1e10,
});

const port = process.env.SERVER_PORT;
const auth = new AuthenticationService();
const encryptionServ = new EncryptionService();
const keysServ = new EncryptionKeysService();
const tokenService = new TokenService();

app.use(express.json());

app.post("/login", auth.loginMiddleware);

app.post("/register", auth.registerMiddleware);

app.post("/decrypt", encryptionServ.decryptMiddleware);

app.get("/authencticate", auth.checkTokenMiddleware, (req, res) => {
    res.status(200).send({ ...req.data });
});

app.get("/", (req, res) => {
    res.send({ message: "Hello World!" });
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

io.on("connection", (socket) => {
    console.log("a user connected", socket.handshake.auth);
});

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

    socket.on("new private message", async (symmetricEncryptedMessageObj) => {
        messageObject = await encryptionServ.decryptSymmetric(
            symmetricEncryptedMessageObj
        );
        const id = messageObject.to.id;
        const user = activeUsers.find((user) => id === user.userId);

        if (!user) {
            return;
        }

        const socketId = user.socketId;

        const { token, ...messageWithoutToken } = messageObject;

        let decodedToken;
        try {
            decodedToken = tokenService.verify(token);
        } catch (error) {
            return socket.emit("unauthorized");
        }

        if (
            !decodedToken ||
            decodedToken.username != messageObject.from.username ||
            decodedToken.id != messageObject.from.id
        ) {
            console.error("Unauthorized", decodedToken, messageObject.to);
            return;
        }
        messageService.save(messageWithoutToken);

        const toPubKey = await keysServ.getPublicKey(messageObject.to.username);

        const encryptedMessage =
            messageObject.type === "picture"
                ? messageObject
                : await encryptionServ.encrypt(messageObject.content, toPubKey);

        const encryptedMessageBase64 =
            messageObject.type === "picture"
                ? messageObject
                : await encryptionServ.encodeArrayBuffersToBase64(
                      encryptedMessage
                  );

        const toSend = {
            from: messageObject.from,
            to: messageObject.to,
            content:
                messageObject.type === "picture"
                    ? messageObject.content
                    : encryptedMessageBase64,
            createdAt: messageObject.createdAt,
            type: messageObject.type,
        };
        socket.to(socketId).emit("private message", toSend);
    });

    socket.on("get chat", async (id1, id2, token, page) => {
        let verifiedToken;
        try {
            verifiedToken = tokenService.verify(token);
        } catch (error) {
            console.error(error);
            return socket.emit("unauthorized");
        }

        if (verifiedToken.id !== id2) {
            console.log(verifiedToken);
            return socket.emit("unauthorized");
        }

        const result = await messageService.getConversation(id1, id2, page);
        console.log("result:", result);
        socket.emit("get chat", result);
    });
});

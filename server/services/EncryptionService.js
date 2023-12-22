import "dotenv/config";
import { EncryptionKeysService } from "./EncryptionKeysService.js";

const serverPrivateKeyBase64 = process.env.ENCRYPTION_PRIVATE_KEY;
const serverPublicKeyBase64 = process.env.ENCRYPTION_PUBLIC_KEY;

// const message = {
//     from: { username: credentials.name, id: credentials.id }, // TODO: Add token
//     to: { username: reciever.username, id: reciever.id },
//     content: currentMessage,
//     createdAt: new Date(),
// };

export class EncryptionService {
    keys = new EncryptionKeysService();
    encodeArrayBuffersToBase64 = (arrayBuffers) => {
        const binaryChunks = arrayBuffers.map((buffer) =>
            Buffer.from(buffer).toString("base64")
        );
        return binaryChunks.join(",");
    };

    decodeBase64ToArrayBuffers = (base64String) => {
        const binaryChunks = base64String.split(",");
        return binaryChunks.map(
            (chunk) => new Uint8Array(Buffer.from(chunk, "base64")).buffer
        );
    };

    encrypt = async (message, publicKey) => {
        try {
            const chunkSize = 75;
            const chunks = [];
            const encoder = new TextEncoder("utf-8");
            for (let i = 0; i < message.length; i += chunkSize) {
                const chunk = message.slice(i, i + chunkSize);
                const encodedMessage = encoder.encode(chunk);

                const encryptedMessage = await crypto.subtle.encrypt(
                    { name: "RSA-OAEP" },
                    publicKey,
                    encodedMessage
                );
                chunks.push(encryptedMessage);
            }
            return chunks;
        } catch (err) {
            console.log(err);
        }
    };

    decrypt = async (encryptedChunks, privateKey) => {
        try {
            const decoder = new TextDecoder("utf-8");

            const decryptedChunks = [];

            for (let i = 0; i < encryptedChunks.length; i++) {
                const encryptedChunk = encryptedChunks[i];
                const decryptedChunk = await crypto.subtle.decrypt(
                    { name: "RSA-OAEP" },
                    privateKey,
                    encryptedChunk
                );
                const decryptedString = decoder.decode(decryptedChunk);
                decryptedChunks.push(decryptedString);
            }
            const decryptedMessage = decryptedChunks.join("");
            return decryptedMessage;
        } catch (err) {
            console.log(err);
            return "";
        }
    };

    decryptServ = async (encryptedChunks, privateKey) => {
        try {
            const decoder = new TextDecoder("utf-8");

            const decryptedChunks = [];

            for (let i = 0; i < encryptedChunks.length; i++) {
                const encryptedChunk = encryptedChunks[i];
                const decryptedChunk = await crypto.subtle.decrypt(
                    { name: "RSA-OAEP" },
                    privateKey,
                    encryptedChunk
                );
                const decryptedString = decoder.decode(decryptedChunk);
                decryptedChunks.push(decryptedString);
            }
            // const decryptedMessage = decryptedChunks.join("");
            return decryptedChunks;
        } catch (err) {
            console.log(err);
            return "";
        }
    };

    decryptServer = async (encryptedChunks, privateKey) => {
        try {
            const decoder = new TextDecoder();

            const decryptedChunks = [];

            for (let i = 0; i < encryptedChunks.length; i++) {
                const encryptedChunk = encryptedChunks[i];
                const decryptedChunk = await crypto.subtle.decrypt(
                    { name: "RSA-OAEP" },
                    privateKey,
                    encryptedChunk
                );
                const decryptedString = decoder.decode(decryptedChunk);
                decryptedChunks.push(decryptedString);
            }
            return decryptedChunks;
        } catch (err) {
            console.log(err);
        }
    };

    decryptMiddleware = async (req, res) => {
        const encryptedMessage = req.body.encryptedMessage;
        const toUsername = req.body.toUsername;
        try {
            const privateKey = await this.keys.getPrivateKey(toUsername);
            const decryptedMessage = await this.decrypt(
                encryptedMessage,
                privateKey
            );
            res.status(200).json({ message: decryptedMessage }).end();
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: undefined }).end();
        }
    };

    // decryptServer = async (messageObject) => {
    //     const serverPrivateKey = await this.keys.convertFromBase64PrivateKey(
    //         serverPrivateKeyBase64
    //     );
    //     const firstDecrypt = await this.decrypt(
    //         messageObject.content,
    //         serverPrivateKey
    //     );
    //     return {
    //         from: messageObject.from,
    //         to: messageObject.to,
    //         content: firstDecrypt,
    //         createdAt: messageObject.createdAt,
    //     };
    // };

    doubleEncrypt = async (messageObject) => {
        try {
            const recipientUsername = messageObject.to.username;
            const message = messageObject.content;
            const recipientPublicKey = await this.keys.getPublicKey(
                recipientUsername
            );

            const firstEncrypt = await this.encrypt(
                message,
                recipientPublicKey
            );

            const serverPublicKey = await this.keys.convertFromBase64PublicKey(
                serverPublicKeyBase64
            );

            const base64Message = encodeArrayBuffersToBase64(firstEncrypt);

            const encryptedTwice = await this.encrypt(
                base64Message,
                serverPublicKey
            );

            const base64Encrypted2 = encodeArrayBuffersToBase64(encryptedTwice);

            // firstEncrypt.forEach(async (el) => {
            //     const encryptedEl = await crypto.subtle.encrypt(
            //         { name: "RSA-OAEP" },
            //         serverPublicKey,
            //         el
            //     );
            //     encryptedTwice.push(encryptedEl);
            // });
            return {
                from: messageObject.from,
                to: messageObject.to,
                content: base64Encrypted2,
                createdAt: messageObject.createdAt,
            };
        } catch (err) {
            console.log(err);
        }
    };

    doubleDecrypt = async (messageObject) => {
        try {
            const serverPrivateKey =
                await this.keys.convertFromBase64PrivateKey(
                    serverPrivateKeyBase64
                );

            const encrypted2decrypt = decodeBase64ToArrayBuffers(
                messageObject.content
            );

            const decrypted1base64 = await decryptMessage(
                encrypted2decrypt,
                serverPrivateKey
            );

            const decrypted1 = decodeBase64ToArrayBuffers(decrypted1base64);
            const privKey = await this.keys.getPrivateKey(
                messageObject.to.username
            );

            const decrypted2 = await decryptMessage(decrypted1, privKey);

            return {
                from: messageObject.from,
                to: messageObject.to,
                content: decrypted2,
                createdAt: messageObject.createdAt,
            };
        } catch (err) {
            console.log(err);
            console.log(messageObject);
        }
    };
}

import "dotenv/config";
import { EncryptionKeysService } from "./EncryptionKeysService.js";

const serverPrivateKeyBase64 = process.env.ENCRYPTION_PRIVATE_KEY;
const serverPublicKeyBase64 = process.env.ENCRYPTION_PUBLIC_KEY;
const symmetricKeyBase64 = process.env.ENCRYPTION_SYMMETRIC_KEY;

// <-------- Message Object looks like that --------->
// const message = {
//     from: { username: credentials.name, id: credentials.id }, // TODO: Add token
//     to: { username: reciever.username, id: reciever.id },
//     content: currentMessage,
//     createdAt: new Date(),
//     type: String,
//     token: String, //optional
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
            console.log("Error:", err);
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
            console.log("Error:", err);
            return "";
        }
    };

    decryptServer = async (messageObject) => {
        try {
            const serverPrivateKey =
                await this.keys.convertFromBase64PrivateKey(
                    serverPrivateKeyBase64
                );

            const encrypted2decrypt = this.decodeBase64ToArrayBuffers(
                messageObject.content
            );

            const decrypted1base64 = await this.decrypt(
                encrypted2decrypt,
                serverPrivateKey
            );
            return {
                from: messageObject.from,
                to: messageObject.to,
                content: decrypted1base64,
                createdAt: messageObject.createdAt,
                type: messageObject.type,
            };
        } catch (err) {
            console.log("Error:", err);
        }
    };

    decryptSymmetric = async (messageObject) => {
        const symmetricKey = await this.keys.convertFromBase64SymmetricKey(
            symmetricKeyBase64
        );
        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: new Uint8Array(12), // No randomisation
            },
            symmetricKey,
            messageObject.content
        );
        const decoder = new TextDecoder();
        const decryptedMessage = decoder.decode(decryptedBuffer);
        return {
            from: messageObject.from,
            to: messageObject.to,
            content: decryptedMessage,
            createdAt: messageObject.createdAt,
            type: messageObject.type,
            token: messageObject.token,
        };
    };

    encryptServer = async (messageObject) => {
        try {
            const serverPublicKey = await this.keys.convertFromBase64PublicKey(
                serverPublicKeyBase64
            );

            const encrypted = await this.encrypt(
                messageObject.content,
                serverPublicKey
            );

            const base64Encrypted = this.encodeArrayBuffersToBase64(encrypted);
            return {
                from: messageObject.from,
                to: messageObject.to,
                content: base64Encrypted,
                createdAt: messageObject.createdAt,
                type: messageObject.type,
                token: messageObject.token,
            };
        } catch (err) {
            console.log("Error:", err);
        }
    };

    decryptMiddleware = async (req, res) => {
        const encryptedMessageBase64 = req.body.encryptedMessage;
        const toUsername = req.body.toUsername;
        const encryptedArrayBuf = this.decodeBase64ToArrayBuffers(
            encryptedMessageBase64
        );

        try {
            const privateKey = await this.keys.getPrivateKey(toUsername);
            const decryptedMessage = await this.decrypt(
                encryptedArrayBuf,
                privateKey
            );
            res.status(200).json({ content: decryptedMessage }).end();
        } catch (err) {
            console.log("Error:", err);
            res.status(400).json({ content: undefined }).end();
        }
    };

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

            const base64Encrypted1 =
                this.encodeArrayBuffersToBase64(firstEncrypt);

            const currentMessage = {
                from: messageObject.from,
                to: messageObject.to,
                content: base64Encrypted1,
                createdAt: messageObject.createdAt,
                type: messageObject.type,
            };

            return await this.encryptServer(currentMessage);
        } catch (err) {
            console.log("Error:", err);
        }
    };

    doubleDecrypt = async (messageObject) => {
        try {
            const decryptedFromServer = await this.decryptServer(messageObject);
            const privKey = await this.keys.getPrivateKey(
                messageObject.to.username
            );

            const base64toArrayBuf = this.decodeBase64ToArrayBuffers(
                decryptedFromServer.content
            );
            const decrypted2 = await this.decrypt(base64toArrayBuf, privKey);

            return {
                from: messageObject.from,
                to: messageObject.to,
                content: decrypted2,
                createdAt: messageObject.createdAt,
                type: messageObject.type,
            };
        } catch (err) {
            console.log("Error:", err);
            console.log(messageObject);
        }
    };
}

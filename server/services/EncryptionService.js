import { database } from "../knexconfig.js";
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

    encrypt = async (message, publicKey) => {
        const encoder = new TextEncoder();
        const encodedMessage = encoder.encode(message);

        const encryptedMessage = await crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            encodedMessage
        );

        return new Uint8Array(encryptedMessage);
    };

    decrypt = async (encryptedMessage, privateKey) => {
        const decoder = new TextDecoder();

        const decryptedMessage = await crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            encryptedMessage
        );
        return decoder.decode(decryptedMessage);
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

    decryptServer = async (messageObject) => {
        const serverPrivateKey = await this.keys.convertFromBase64PrivateKey(
            serverPrivateKeyBase64
        );
        const firstDecrypt = await this.decrypt(
            messageObject.content,
            serverPrivateKey
        );
        return {
            from: messageObject.from,
            to: messageObject.to,
            content: firstDecrypt,
            createdAt: messageObject.createdAt,
        };
    };

    doubleEncrypt = async (messageObject) => {
        const toUsername = messageObject.to.username;
        const message = messageObject.content;
        const pubKey = await this.keys.getPublicKey(toUsername);
        const firstEncrypt = await this.encrypt(message, pubKey);
        const serverPublicKey = await this.keys.convertFromBase64PublicKey(
            serverPublicKeyBase64
        );
        const secondEncrypt = await this.encrypt(firstEncrypt, serverPublicKey);
        return {
            from: messageObject.from,
            to: messageObject.to,
            content: secondEncrypt,
            createdAt: messageObject.createdAt,
        };
    };

    doubleDecrypt = async (messageObject) => {
        try {
            const serverPrivateKey =
                await this.keys.convertFromBase64PrivateKey(
                    serverPrivateKeyBase64
                );
            const firstDecrypt = await this.decrypt(
                messageObject.content,
                serverPrivateKey
            );
            const privKey = await this.keys.getPrivateKey(
                messageObject.to.username
            );
            const message = await this.decrypt(firstDecrypt, privKey);
            return {
                from: messageObject.from,
                to: messageObject.to,
                content: message,
                createdAt: messageObject.createdAt,
            };
        } catch (err) {
            console.log(err);
            console.log(messageObject);
        }
    };
}

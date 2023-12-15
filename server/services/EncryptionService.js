import { database } from "../knexconfig.js";
import "dotenv/config";
import { messageService } from "./MessageService.js";

const serverPrivateKey = process.env.ENCRYPTION_PRIVATE_KEY;
const serverPublicKey = process.env.ENCRYPTION_PUBLIC_KEY;

export class EncryptionService {
    getPublicKey = async (username) => {
        user = await database("users").where("username", username).first();
        return user.publicKey;
    };
    setPublicKey = async (username, newPublicKey) => {
        return await database("users").where("username", username).update({
            publicKey: newPublicKey,
        });
    };

    getPrivateKey = async (username) => {
        user = await database("users").where("username", username).first();
        return user.privateKey;
    };
    setPrivateKey = async (username, newPrivateKey) => {
        return await database("users").where("username", username).update({
            privateKey: newPrivateKey,
        });
    };

    generateKeys = async () => {
        return await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: { name: "SHA-256" },
            },
            true,
            ["encrypt", "decrypt"]
        );
    };

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

    decryptServer = async (messageObject) => {
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

    // const message = {
    //     from: { username: credentials.name, id: credentials.id }, // TODO: Add token
    //     to: { username: reciever.username, id: reciever.id },
    //     content: currentMessage,
    //     createdAt: new Date(),
    // };
    doubleEncrypt = async (messageObject) => {
        const toUsername = messageObject.to.username;
        const message = messageObject.content;
        const firstEncrypt = await this.encrypt(
            message,
            this.getPublicKey(toUsername)
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
        const firstDecrypt = await this.decrypt(
            messageObject.content,
            serverPrivateKey
        );
        const message = await this.decrypt(
            firstDecrypt,
            this.getPrivateKey(messageObject.to.username)
        );
        return {
            from: messageObject.from,
            to: messageObject.to,
            content: message,
            createdAt: messageObject.createdAt,
        };
    };
}

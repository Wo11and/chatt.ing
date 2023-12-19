import { database } from "../knexconfig.js";
import "dotenv/config";

const serverPrivateKeyBase64 = process.env.ENCRYPTION_PRIVATE_KEY;
const serverPublicKeyBase64 = process.env.ENCRYPTION_PUBLIC_KEY;

export class EncryptionService {
    convertToBase64PublicKey = async (keyPair) => {
        const publicKey = await crypto.subtle.exportKey(
            "spki",
            keyPair.publicKey
        );
        const publicKeyBase64 = btoa(
            String.fromCharCode(...new Uint8Array(publicKey))
        );
        return publicKeyBase64;
    };

    convertToBase64PrivateKey = async (keyPair) => {
        const privateKey = await crypto.subtle.exportKey(
            "pkcs8",
            keyPair.privateKey
        );
        const privateKeyBase64 = btoa(
            String.fromCharCode(...new Uint8Array(privateKey))
        );
        return privateKeyBase64;
    };

    convertFromBase64PublicKey = async (base64PublicKey) => {
        // Decode the base64-encoded public key
        const publicKeyBinary = atob(base64PublicKey);
        // Convert the binary data to a Uint8Array
        const publicKeyBytes = new Uint8Array(publicKeyBinary.length);
        for (let i = 0; i < publicKeyBinary.length; ++i) {
            publicKeyBytes[i] = publicKeyBinary.charCodeAt(i);
        }
        // Import the public key
        const importedPublicKey = await crypto.subtle.importKey(
            "spki",
            publicKeyBytes,
            {
                name: "RSA-OAEP",
                hash: { name: "SHA-256" },
            },
            true,
            ["encrypt"]
        );
        // Now you can use the imported public key for encryption
        // For example, you can use crypto.subtle.encrypt()
        return importedPublicKey;
    };

    convertFromBase64PrivateKey = async (base64PrivateKey) => {
        // Decode the base64-encoded private key
        const privateKeyBinary = atob(base64PrivateKey);
        // Convert the binary data to a Uint8Array
        const privateKeyBytes = new Uint8Array(privateKeyBinary.length);
        for (let i = 0; i < privateKeyBinary.length; ++i) {
            privateKeyBytes[i] = privateKeyBinary.charCodeAt(i);
        }
        // Import the private key
        const importedPrivateKey = await crypto.subtle.importKey(
            "pkcs8",
            privateKeyBytes,
            {
                name: "RSA-OAEP",
                hash: { name: "SHA-256" },
            },
            true,
            ["decrypt"]
        );
        // Now you can use the imported private key for decryption
        // For example, you can use crypto.subtle.decrypt()
        return importedPrivateKey;
    };

    getPublicKey = async (username) => {
        const user = await database("users")
            .where("username", username)
            .first();
        const base64 = user.publicKey;
        const toReturn = await this.convertFromBase64PublicKey(base64);
        return toReturn;
    };
    // setPublicKey = async (username, newPublicKey) => {
    //     return await database("users")
    //         .where("username", username)
    //         .update({
    //             publicKey: JSON.stringify(newPublicKey),
    //         });
    // };

    getPrivateKey = async (username) => {
        const user = await database("users")
            .where("username", username)
            .first();
        console.log(user);
        const base64 = user.publicKey;
        const toReturn = await this.convertFromBase64PrivateKey(base64);
        return toReturn;
    };
    // setPrivateKey = async (username, newPrivateKey) => {
    //     return await database("users")
    //         .where("username", username)
    //         .update({
    //             privateKey: JSON.stringify(newPrivateKey),
    //         });
    // };

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

    decryptMiddleware = async (req, res) => {
        const encryptedMessage = req.body.encryptedMessage;
        const toUsername = req.body.toUsername;
        try {
            const privateKey = await this.getPrivateKey(toUsername);
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
        const serverPrivateKey = await this.convertFromBase64PrivateKey(
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

    // const message = {
    //     from: { username: credentials.name, id: credentials.id }, // TODO: Add token
    //     to: { username: reciever.username, id: reciever.id },
    //     content: currentMessage,
    //     createdAt: new Date(),
    // };

    doubleEncrypt = async (messageObject) => {
        const toUsername = messageObject.to.username;
        const message = messageObject.content;
        const pubKey = await this.getPublicKey(toUsername);
        const firstEncrypt = await this.encrypt(message, pubKey);
        const serverPublicKey = await this.convertFromBase64PublicKey(
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
            const serverPrivateKey = await this.convertFromBase64PrivateKey(
                serverPrivateKeyBase64
            );
            const firstDecrypt = await this.decrypt(
                messageObject.content,
                serverPrivateKey
            );
            const privKey = await this.getPrivateKey(messageObject.to.username);
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

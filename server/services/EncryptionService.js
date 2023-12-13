import { mongoDbClient } from "../mongodbconfig.js";
import { database } from "../knexconfig.js";

export class EncryptionService {
    getPublicKey = async (username) => {};
    setPublicKey = async (username, newPublicKey) => {};

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

    encrypt = async (message, to) => {};

    decrypt = async (encryptedMessage) => {};
}

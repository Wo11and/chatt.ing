import { database } from "../knexfile.js";

export class EncryptionKeysService {
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

    convertToBase64SymmetricKey = async (key) => {
        const keyBuffer = await crypto.subtle.exportKey("raw", key);
        const keyBase64 = btoa(
            String.fromCharCode.apply(null, new Uint8Array(keyBuffer))
        );
        return keyBase64;
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

    convertFromBase64SymmetricKey = async (keyBase64) => {
        const keyBufferDecoded = new Uint8Array(
            atob(keyBase64)
                .split("")
                .map((char) => char.charCodeAt(0))
        );
        const keyDecoded = await crypto.subtle.importKey(
            "raw",
            keyBufferDecoded,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        return keyDecoded;
    };

    getPublicKey = async (username) => {
        const user = await database("users")
            .where("username", username)
            .first();
        const base64 = user.publicKey;
        const toReturn = await this.convertFromBase64PublicKey(base64);
        return toReturn;
    };

    getPrivateKey = async (username) => {
        const user = await database("users")
            .where("username", username)
            .first();
        const base64 = user.privateKey;
        const toReturn = await this.convertFromBase64PrivateKey(base64);
        return toReturn;
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
}

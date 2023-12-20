import { describe, expect, test } from "@jest/globals";
import { EncryptionService } from "../../services/EncryptionService";
import { EncryptionKeysService } from "../../services/EncryptionKeysService";
const encryptServ = new EncryptionService();
const keysServ = new EncryptionKeysService();

const keyPair = await keysServ.generateKeys();
const message = "test";
const serverPublic = await keysServ.convertFromBase64PublicKey(
    process.env.ENCRYPTION_PUBLIC_KEY
);
const serverPrivate = await keysServ.convertFromBase64PrivateKey(
    process.env.ENCRYPTION_PRIVATE_KEY
);

describe("Encryption Module", () => {
    test("Encrypts a message using a public key", async () => {
        const encrypted = await encryptServ.encrypt(message, keyPair.publicKey);
        expect(encrypted).not.toBeUndefined();
    });

    test("Decrypts encrypted message with a private key", async () => {
        const encrypted = await encryptServ.encrypt(message, keyPair.publicKey);
        const decrypted = await encryptServ.decrypt(
            encrypted,
            keyPair.privateKey
        );
        expect(decrypted).toMatch("test");
    });
    test("Double encrypt", async () => {
        const encryptedOnce = await encryptServ.encrypt(
            message,
            keyPair.publicKey
        );
        // const encryptedTwice = [];

        // const chunkSize = 100;
        // const chunks = [];
        // const encoder = new TextEncoder();
        // for (let i = 0; i < encryptedOnce.length; i += chunkSize) {
        //     const chunk = encryptedOnce.slice(i, i + chunkSize);
        //     const encodedMessage = encoder.encode(chunk);
        //     const encryptedMessage = await crypto.subtle.encrypt(
        //         { name: "RSA-OAEP" },
        //         serverPublic,
        //         encodedMessage
        //     );
        //     chunks.push(encryptedMessage);
        // }
        const chunks = await encryptServ.encrypt(encryptedOnce, serverPublic);
        // console.log(chunks);
        expect(chunks).not.toBeUndefined();
    });

    test("Two encrypt-decrypts", async () => {
        const encryptedOnce = await encryptServ.encrypt(
            message,
            keyPair.publicKey
        );

        // First decryption
        const decryptedOnce = await encryptServ.decrypt(
            encryptedOnce,
            keyPair.privateKey
        );

        // Second encryption
        const encryptedTwice = await encryptServ.encrypt(
            decryptedOnce,
            serverPublic
        );

        // Second decryption
        const decryptedTwice = await encryptServ.decrypt(
            encryptedTwice,
            serverPrivate
        );

        // Assert that the final decrypted message matches the original message
        expect(decryptedTwice).toMatch(message);
    });

    test("Double decrypt", async () => {
        // First encryption
        const encryptedOnce = await encryptServ.encrypt(
            message,
            keyPair.publicKey
        );
        console.log("Encrypted Once:", encryptedOnce);
        // const ui8EncryptOnce = new Uint8Array(encryptedOnce.flat()[0]);
        // console.log(ui8EncryptOnce);
        var decoder = new TextDecoder("utf-8");
        // console.log(decoder.decode(ui8EncryptOnce));

        // Second encryption
        const encryptedTwice = [];
        for (const el of encryptedOnce) {
            const ui8El = new Uint8Array(el);
            const encryptedTwiceEl = await encryptServ.encrypt(
                decoder.decode(ui8El),
                serverPublic
            );
            encryptedTwice.push(encryptedTwiceEl);
        }
        console.log("Encrypted Twice:", encryptedTwice);

        // Second decryption
        var decryptedTwice = [];
        for (const el of encryptedTwice) {
            console.log(el);
            const decryptedTwiceEl = await encryptServ.decryptServ(
                el,
                serverPrivate
            );
            decryptedTwice.push(decryptedTwiceEl);
        }
        var encoder = new TextEncoder("utf-8");

        console.log("Decrypted Twice:", decryptedTwice);
        const ui8DecryTwice = [];
        for (const el of decryptedTwice[0]) {
            let encoded = new Uint8Array(encoder.encode(el).buffer);
            // Ensure that encoded is exactly 256 bytes
            const paddedEncoded = new Uint8Array(256);
            paddedEncoded.set(encoded.slice(0, Math.min(256, encoded.length)));

            ui8DecryTwice.push(paddedEncoded.buffer);
        }
        console.log("Encoded Decrypted Twice:", ui8DecryTwice);

        // First decryption
        const decryptedOnce = await encryptServ.decrypt(
            ui8DecryTwice,
            keyPair.privateKey
        );
        console.log("Decrypted Once:", decryptedOnce);

        // Assert that the final decrypted message matches the original message
        expect(decryptedOnce).toMatch(message);
    });
    test("Decrypt only using server private key", async () => {});
});

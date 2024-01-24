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
const symmeticKey = await keysServ.convertFromBase64SymmeticKey(
    process.env.ENCRYPTION_SYMMETRIC_KEY
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
        const chunks = await encryptServ.encrypt(encryptedOnce, serverPublic);
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
        async function generateAsymmetricKeyPair() {
            const subtle = crypto.subtle;
            const keys = await subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                    hash: { name: "SHA-256" },
                },
                true,
                ["encrypt", "decrypt"]
            );
            return keys;
        }

        const a = await generateAsymmetricKeyPair();
        const Pubkey1 = a.publicKey;
        const PrivKey1 = a.privateKey;
        const b = await generateAsymmetricKeyPair();
        const PubKey2 = b.publicKey;
        const PrivKey2 = b.privateKey;

        const encrypted = await encryptServ.encrypt(message, Pubkey1);

        const base64Message = encryptServ.encodeArrayBuffersToBase64(encrypted);

        const encrypted2 = await encryptServ.encrypt(base64Message, PubKey2);

        const base64Encrypted2 =
            encryptServ.encodeArrayBuffersToBase64(encrypted2);

        const encrypted2decrypt =
            encryptServ.decodeBase64ToArrayBuffers(base64Encrypted2);

        const decrypted1base64 = await encryptServ.decrypt(
            encrypted2decrypt,
            PrivKey2
        );

        const decrypted1 =
            encryptServ.decodeBase64ToArrayBuffers(decrypted1base64);

        const decrypted2 = await encryptServ.decrypt(decrypted1, PrivKey1);

        expect(decrypted2).toMatch(message);
    });
    test("Decrypt only using server private key", async () => {});
});

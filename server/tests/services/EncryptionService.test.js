import { describe, expect, test } from "@jest/globals";
import { EncryptionService } from "../../services/EncryptionService";

const encryptServ = new EncryptionService();

describe("Encryption Module", () => {
    test("Encrypts a message using a public key", async () => {});

    test("Decrypts encrypted message with a private key", async () => {});
    test("Double encrypt", async () => {});

    test("Double decrypt", async () => {});
    test("Decrypt only using server private key", async () => {});
});

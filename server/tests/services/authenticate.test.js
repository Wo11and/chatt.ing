const { describe, expect, test } = require("@jest/globals");
const { AuthenticationService } = require("../../services/authenticate.js");

const auth = new AuthenticationService();
const username = "testuser9";
const notExistingUsername = "not_existing_in_db";
const validPassword = "testpassword";
const wrongPassword = "123";

describe("Authentication Module", () => {
    test("Registers new user, adds them to DB", async () => {
        await expect(auth.register(username, validPassword)).resolves.not.toThrow();
    });

    test("Tries registering existing user", async () => {
        await expect(auth.register(username, validPassword)).rejects.toThrowError();
    });

    test("Logins existing user", async () => {
        await expect(auth.login(username, validPassword)).resolves.not.toThrow();
    });

    test("Login not existing user", async () => {
        await expect(auth.login(notExistingUsername, wrongPassword)).rejects.toThrowError();
    });

    test("Login existing user with wrong pass", async () => {
        await expect(auth.login(username, wrongPassword)).rejects.toThrowError();
    });
});

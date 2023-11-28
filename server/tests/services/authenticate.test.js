const { describe, expect, test } = require("@jest/globals");
const { AuthenticationService } = require("../../services/authenticate.js");

const auth = new AuthenticationService();
const username = "testuser14";
const notExistingUsername = "not_existing_in_db1";
const validPassword = "testpassword";
const wrongPassword = "123";

describe("Authentication Module", () => {
    test("Registers new user, adds them to DB", async () => {
        const data = await auth.register(username, validPassword);
        expect(data).not.toBeUndefined();
    });

    test("Tries registering existing user", async () => {
        try {
            await auth.register(username, validPassword);
        } catch (e) {
            expect(e.toString()).toMatch("Error: Username already exists");
        }
    });
    test("Logins existing user", async () => {
        const data = await auth.login(username, validPassword);
        expect(data).not.toBeUndefined();
    });

    test("Tries loging not existing user", async () => {
        try {
            await auth.login(notExistingUsername, wrongPassword);
        } catch (e) {
            expect(e.toString()).toMatch("Error: Username doesnt exist");
        }
    });
    test("Login existing user with wrong pass", async () => {
        try {
            await auth.login(username, wrongPassword);
        } catch (e) {
            expect(e.toString()).toMatch("Password not matching");
        }
    });
});

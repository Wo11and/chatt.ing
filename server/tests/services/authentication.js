import Knex from "knex";

import { database } from "../../knexconfig.js";
const pg = Knex(database);
const bcrypt_saltRounds = 10;

import { AuthenticationService } from "../../services/authenticate.js";

const auth = new AuthenticationService();
let username = "testuser8";
let pass = "testpassword".toString();
let wrongpass = "123".toString();

const a = await auth.register(username, pass);
try {
    const a = await auth.register(username, pass);
} catch (err) {
    //must throw cuz user already in db
    //nothing
    console.log("asd2");
}
const b = await auth.login(username, pass);
try {
    const a = await auth.login(username, wrongpass);
} catch (err) {
    //must throw (wrong password)
    console.log("asd3");
}

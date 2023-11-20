import Knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const config = {
    client: "pg",
    connection: {
        connectionString: process.env.DB_URL,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASS,
        ssl: false,
    },
};
const pg = Knex(config);
const bcrypt_saltRounds = 10;

import { AuthenticationService } from "../../services/authenticate.js";


const auth = new AuthenticationService;
let username = "testuser8";
let pass = "testpassword".toString();
let wrongpass = "123".toString();



const a = await auth.register(username, pass);
try{
    const a = await auth.register(username, pass);
}
catch(err){ //must throw cuz user already in db
    //nothing
    console.log("asd2");

}
const b = await auth.login(username, pass);
try{
    const a = await auth.login(username, wrongpass);
}
catch(err){ //must throw (wrong password)
    console.log("asd3");
}

import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import { database } from "../knexconfig.js";
import { UsersDBService } from "./UsersDBService.js";
import { EncryptionService } from "./EncryptionService.js";

const webTokenSecret = process.env.WEB_TOKEN_SECRET;
const bcrypt_saltRounds = 10;

export class AuthenticationService {
    usersDB = new UsersDBService();
    encryptServ = new EncryptionService();

    login = async (username, password) => {
        try {
            //check if user exists in db
            const user = this.usersDB.getUser(username);
            if (!user) {
                // If username exists, return an error or throw an exception
                throw new Error("Username doesnt exist");
            }
            // hash == db password

            const passwordMatch = await new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });

            if (!passwordMatch) {
                throw new Error("Password not matching");
            }

            //id -> db id
            const token = jsonwebtoken.sign(
                { username, id: user.id },
                webTokenSecret,
                {
                    expiresIn: "1h",
                }
            );
            const userInfo = { name: user.username, id: user.id };
            return { token, userInfo };
        } catch (err) {
            console.log("Error during login: ", err);
            throw err;
        }
    };

    register = async (username, password) => {
        try {
            //connect to db
            await database.raw("SELECT 1");
            const user = this.usersDB.getUser(username);
            if (user !== undefined) {
                // If username exists, return an error or throw an exception
                throw new Error("Username already exists");
            }
            const hashedPassword = await bcrypt.hash(
                password,
                bcrypt_saltRounds
            );

            const userKeys = await this.encryptServ.generateKeys();
            // Store hash and username in DB
            await this.usersDB.addUser({
                username,
                password: hashedPassword,
                publicKey: userKeys.publicKey,
                privateKey: userKeys.privateKey,
            });
            user = await this.usersDB.getUser(username);

            console.log("Created user: " + user.id);
            const token = jsonwebtoken.sign(
                { username: user.username, id: user.id },
                webTokenSecret,
                {
                    expiresIn: "1h",
                }
            );
            const userInfo = { name: user.username, id: user.id };
            return { token, userInfo };
        } catch (error) {
            // Handle any errors that occur during registration
            console.error("Error during registration:", error.message);
            throw error;
        }
    };

    checkTokenMiddleware = (req, res, next) => {
        const header = req.headers["authorization"];
        let token = undefined;
        if (header) {
            const bearer = header.split(" ");
            token = bearer[1];
            if (!token) {
                return res
                    .status(401)
                    .json({ message: "Unauthorized: token is undefined" })
                    .end();
            }
            token = token.slice(1, -1);
            jsonwebtoken.verify(token, webTokenSecret, (err, decoded) => {
                if (err) {
                    console.log(err);
                    return res
                        .status(401)
                        .json({ message: "Unauthorized: token not valid" })
                        .end();
                }
                req.data = {};
                req.data.token = token;
                req.data.userData = decoded;
                return next();
            });
        } else {
            return res.status(401).json({ message: "Unauthorized" }).end();
        }
    };

    registerMiddleware = async (req, res, next) => {
        const username = req.body.username;
        const password = req.body.password;
        try {
            const data = await this.register(username, password);
            res.status(200).json(data).end(); //{token, userInfo}
        } catch (err) {
            if (err.message == "Username already exists") {
                res.status(200).json({ register: "failed" }).end();
            } else {
                console.log("Cant register:", err.message);
                res.status(400).json({ undefined }).end();
            }
        }
    };

    loginMiddleware = async (req, res, next) => {
        const username = req.body.username;
        const password = req.body.password;
        try {
            const data = await this.login(username, password);
            res.status(200).json(data).end(); //{token, userInfo}
        } catch (err) {
            if (
                err.message == "Password not matching" ||
                err.message == "Username doesnt exist"
            ) {
                res.status(200).json({ login: "failed" }).end();
            } else {
                console.log("Cant login:", err.message);
                res.status(400).json({ undefined }).end();
                return;
            }
        }
    };
}

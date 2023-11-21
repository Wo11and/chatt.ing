import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import { database } from "../knexconfig.js";

const webTokenSecret = process.env.WEB_TOKEN_SECRET;
const bcrypt_saltRounds = 10;

export class AuthenticationService {
    checkTokenMiddleware = (req, res, next) => {
        const header = req.headers["authorization"];
        if (typeof header !== "undefined") {
            const bearer = header.split(" ");
            const token = bearer[1];
            if (!token) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            //check if token is valid
            jwt.verify(token, webTokenSecret, (err, decoded) => {
                if (err) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                req.token = token;
                req.userData = decoded;
                next();
            });
        }
        return res.status(401).json({ message: "Unauthorized" });
    };

    registerMiddleware(req, res, next) {
        const username = req.body.username;
        const password = req.body.password;
        try {
            const token = this.register(username, password);
            res.json({ token });
            res.writeHead(200);
            res.end();
        } catch (err) {
            console.log(err);
            console.log("cant register");
            res.writeHead(400);
            res.json({ undefined });
            res.end();
        }
    }

    loginMiddleware(req, res, next) {
        const username = req.body.username;
        const password = req.body.password;
        try {
            const token = this.login(username, password);
            res.json({ token });
            res.writeHead(200);
            res.end();
        } catch (err) {
            console.log(err);
            console.log("cant login");
            res.writeHead(400);
            res.json({ undefined });
            res.end();
        }
    }

    async register(username, password) {
        try {
            //connect to db
            await database.raw("SELECT 1");
            const user = await database("users").where("username", username).first();
            if (user !== undefined) {
                // If username exists, return an error or throw an exception
                throw new Error("Username already exists");
            }
            const hashedPassword = await bcrypt.hash(password, bcrypt_saltRounds);
            // Store hash and username in DB
            //...
            const [userId] = await database("users").insert(
                {
                    username,
                    password: hashedPassword,
                },
                "username"
            );
            console.log("Created user: " + userId);
            const token = jsonwebtoken.sign({ username, password }, webTokenSecret, {
                expiresIn: "1h",
            });
            return token;
        } catch (error) {
            // Handle any errors that occur during registration
            console.error("Error during registration:", error.message);
            throw error;
        }
    }

    async login(username, password) {
        try {
            //check if user exists in db
            const user = await database("users").where("username", username).first();
            if (!user) {
                // If username exists, return an error or throw an exception
                throw new Error("Username doesnt exist");
            }
            // hash == db password

            bcrypt.compare(password, user.password, function (err, result) {
                // result == true/false
                if (err) {
                    console.log(err);
                    throw err;
                }
                if (!result) {
                    throw new Error("Password not matching");
                }
            });

            //id -> db id
            const token = jsonwebtoken.sign({ username, password }, webTokenSecret, {
                expiresIn: "1h",
            });
            return token;
        } catch (err) {
            console.log("Error during login: ", err);
            throw err;
        }
    }
}

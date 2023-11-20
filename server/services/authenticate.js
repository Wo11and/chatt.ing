import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import Knex from 'knex';
import dotenv from "dotenv";

 

dotenv.config();

const config = {
  client: 'pg',
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
  

  
const webTokenSecret = process.env.WEB_TOKEN_SECRET;
const bcrypt_saltRounds = 10;



export class AuthenticationService{


    checkTokenMiddleware = (req, res, next) => {
        const header = req.headers['authorization'];
    
        if(typeof header !== 'undefined') {
            const bearer = header.split(' ');
            const token = bearer[1];
    
            req.token = token;
            next();
        } else {
            //If header is undefined return Forbidden (403)
            res.sendStatus(403)
        }
    }

    registerMiddleware(req, res, next){
        const username = req.body.username;
        const password = req.body.password;
        try{
            const token = this.register(username, password);
            res.send(token);
            res.end();  
            next();
        }
        catch(err){
            console.log(err);
            console.log("cant register");
            res.writeHead(400);
        }
    }


    loginMiddleware(req, res, next){
        const username = req.body.username;
        const password = req.body.password;
        try{
            const token = this.login(username,password);
            res.send(token);
        }
        catch(err){
            console.log(err);
            console.log("cant login");
        }
    }


    async register(username, password){
        try{
            //connect to db
            await pg.raw('SELECT 1');
            const user = await pg('users').where('username', username).first();
            if (user !== undefined){
                // If username exists, return an error or throw an exception
                throw new Error('Username already exists');
            }
            const hashedPassword = await bcrypt.hash(password, bcrypt_saltRounds);
            // Store hash and username in DB
            //...
            const [userId] = await pg('users').insert({
                username,
                password: hashedPassword,
            }, 'username');
            console.log("Created user: " + userId);
            const token = jsonwebtoken.sign({username, password},
                webTokenSecret, {expiresIn: '1h'});
            return token;
        } catch (error) {
            // Handle any errors that occur during registration
            console.error('Error during registration:', error.message);
            throw error;
        }
    
    }

    async login(username, password){
        try{
        //TODO: check if username exists -> if not - error
        const user = await pg('users').where('username', username).first();
        if (!user) {
            // If username exists, return an error or throw an exception
            throw new Error('Username doesnt exist');
        }
        //if exists check pass if not error
        // hash == db password

        bcrypt.compare(password, user.password, function(err, result) {
            // result == true/false
            if(err){
                console.log(err);
                throw err;
            }
            if(!result){
                throw new Error("Password not matching");
            }
        });

        //id -> db id
        const token = jsonwebtoken.sign({username, password},
            webTokenSecret, {expiresIn: '1h'});
        return token;
        }
        catch(err){
            console.log("Error during login: ", err);
            throw err;
        }

    }
};

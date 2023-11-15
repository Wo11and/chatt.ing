import jsonwebtoken from "jsonwebtoken";

const webTokenSecret = process.env.WEB_TOKEN_SECRET;

export class AuthenticationService{

    encryptPassword(){
        return;
    }
    
    async register(username, password){
        //TODO: check if username exists
        encrpytedPassword = encryptPassword(password);
        //TODO: add user with pass to db

        //id -> db id
        return generateWebToken(username, id);
    }

    async login(username, password){
        //TODO: check if username exists
        //if exists check pass if not error
        //if pass wrong err

        //id -> db id
        return generateWebToken(username, id);
    }

    async generateWebToken(username, id){
        return jsonwebtoken.sign({username, id}, webTokenSecret, 
            { algorithm: 'RS256' },{ expiresIn: "1h" });
    }
};

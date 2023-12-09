import jsonwebtoken from "jsonwebtoken";
import "dotenv/config";

const webTokenSecret = process.env.WEB_TOKEN_SECRET;

export class TokenService {
    sign(data) {
        return jsonwebtoken.sign(data, webTokenSecret, {
            expiresIn: "1h",
        });
    }

    verify(token) {
        return jsonwebtoken.verify(token, webTokenSecret);
    }
}

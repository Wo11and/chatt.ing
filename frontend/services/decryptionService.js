import { httpService } from "./httpService";
export class decryptionService {
    httpServ = new httpService("http://localhost:3000");

    decrypt = async (encryptedMessage, toUsername) => {
        const decodedMessage = await this.httpServ.post("/decrypt", {
            encryptedMessage,
            toUsername,
        });
        return decodedMessage;
    };
}

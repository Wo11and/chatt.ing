import { mongoDbClient } from "../mongodbconfig.js";
import { EncryptionService } from "./EncryptionService.js";

const encryptionServ = new EncryptionService();
const messages = mongoDbClient.db("chatting").collection("messages");
class MessageService {
    async save(message) {
        const doubleEncryptedMessage = await encryptionServ.doubleEncrypt(
            message
        );
        messages.insertOne(doubleEncryptedMessage);
    }

    async getConversation(id1, id2, page = 1, pageSize = 5) {
        const result = messages
            .find({
                $or: [
                    {
                        $and: [
                            { "from.id": { $eq: id1 } },
                            { "to.id": { $eq: id2 } },
                        ],
                    },
                    {
                        $and: [
                            { "from.id": { $eq: id2 } },
                            { "to.id": { $eq: id1 } },
                        ],
                    },
                ],
            })
            .sort({ createdAt: -1 })
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        let arrResult = await result.toArray();
        arrResult = await Promise.all(
            arrResult.map(async (el) => {
                if (el && el.content) {
                    const res = await encryptionServ.doubleDecrypt(el);
                    return res;
                }
            })
        );
        return arrResult;
    }
}

export const messageService = new MessageService();

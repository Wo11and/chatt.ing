import { mongoDbClient } from "../mongodbconfig.js";
import { EncryptionService } from "./EncryptionService.js";

class MessageService {
    messages = mongoDbClient.db("chatting").collection("messages");
    encryptionServ = new EncryptionService();
    async save(message) {
        const doubleEncryptedMessage =
            this.encryptionServ.doubleEncrypt(message);
        const toInsert = {
            from: message.from,
            to: message.to,
            content: doubleEncryptedMessage,
            createdAt: message.createdAt,
        };
        this.messages.insertOne(toInsert);
    }

    async getConversation(id1, id2, page = 1, pageSize = 5) {
        const result = this.messages
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

        let arrResult = (await result.toArray()).forEach((el) => {
            this.encryptionServ.doubleDecrypt(el);
        });
        return arrResult;
    }
}

export const messageService = new MessageService();

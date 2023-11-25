import { mongoDbClient } from "../mongodbconfig.js";

class MessageService {
	async save(message) {
		await mongoDbClient.connect();
		const messages = mongoDbClient.db("chatting").collection("messages");
		messages.insertOne(message);
	}

	async getConversation(id1, id2, page = 1, pageSize = 5) {
		await mongoDbClient.connect();
		const messages = mongoDbClient.db("chatting").collection("messages");
		const result = messages
			.find({
				$or: [
					{
						$and: [{ "from.id": { $eq: id1 } }, { "to.id": { $eq: id2 } }],
					},
					{
						$and: [{ "from.id": { $eq: id2 } }, { "to.id": { $eq: id1 } }],
					},
				],
			})
			.sort({ createdAt: -1 })
			.skip(pageSize * (page - 1))
			.limit(pageSize);

		return result.toArray();
	}
}

export const messageService = new MessageService();

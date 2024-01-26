import { database } from "../knexconfig.js";

export class UsersDBService {
    getUser = async (username) => {
        const user = await database("users")
            .where("username", username)
            .first();
        return user;
    };

    addUser = async (userInfo) => {
        await database("users").insert(userInfo);
    };

    editUser = (userInfo) => {};
}

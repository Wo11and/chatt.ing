const frontendAddress = import.meta.env.VITE_FRONTEND_ADDRESS;
import { httpService } from "./httpService";

export class Authentication {
    httpServ = new httpService("http://localhost:3000");

    // Get token from local storage, check it and return user info.
    // If no token or wrong token, throw error
    async authenticate() {
        try {
            const token = localStorage.getItem("token");
            console.log("in authenticate");
            const data = await this.httpServ.get("/authencticate", {
                Authorization: `Bearer ${token}`,
            });
            console.log(data);
            if (!data.ok) {
                throw new Error("AuthError");
            }

            return data;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    async login(username, password) {
        const user = { username, password };
        try {
            const data = await this.httpServ.post("/login", user);
            if (!data) {
                return false;
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("chatting-user", data.userInfo);
            window.location.href = `${frontendAddress}/index.html`;
        } catch (error) {
            console.error("Error:", error);
            return false;
        }
    }

    async register(username, password) {
        const user = { username, password };
        try {
            const data = await this.httpServ.post("/register", user);
            if (!data) {
                return false;
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("chatting-user", data.userInfo);
            window.location.href = `${frontendAddress}/index.html`;
        } catch (error) {
            console.error("Error:", error);
        }
    }
}

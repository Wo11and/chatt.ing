import { config } from "../config";
import { httpService } from "./httpService";

const frontendAddress = config.frontendAddress;
export class Authentication {
    httpServ = new httpService("http://localhost:3000");

    // Get token from local storage, check it and return user info.
    // If no token or wrong token, throw error
    async authenticate() {
        try {
            const token = localStorage.getItem("token");
            const data = await this.httpServ.getWithHeader("/authencticate", {
                Authorization: `Bearer ${token}`,
            });
            if (!data) {
                throw new Error("AuthError: data not ok:", data);
            }
            return data;
        } catch (error) {
            console.error("Error in authenticating:", error);
            throw error;
        }
    }

    async login(username, password) {
        const user = { username, password };
        try {
            const data = await this.httpServ.post("/login", user);

            if (!data || data["login"] == "failed") {
                document.getElementById("error__div").style.display = "block";
            } else {
                localStorage.setItem("token", JSON.stringify(data.token));
                localStorage.setItem(
                    "chatting_user",
                    JSON.stringify(data.userInfo)
                );
                window.location.href = `${frontendAddress}/index.html`;
            }
        } catch (error) {
            console.error("Error:", error);
            return false;
        }
    }

    async register(username, password) {
        const user = { username, password };
        try {
            const data = await this.httpServ.post("/register", user);
            if (!data || data["register"] == "failed") {
                document.getElementById("error__div").style.display = "block";
            } else {
                localStorage.setItem("token", JSON.stringify(data.token));
                localStorage.setItem(
                    "chatting_user",
                    JSON.stringify(data.userInfo)
                );
                window.location.href = `${frontendAddress}/index.html`;
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
}

const frontendAddress = import.meta.env.VITE_FRONTEND_ADDRESS;
class httpService {
    header = {
        "Content-Type": "application/json",
    };

    constructor(url) {
        this.url = url;
    }

    async get(route) {
        const response = await fetch(this.url + route, {
            method: "GET",
            headers: this.header,
        });

        return this.getDataFromResponse(response);
    }

    async post(route, body) {
        const response = await fetch(this.url + route, {
            method: "POST",
            headers: this.header,
            body: JSON.stringify(body),
        });

        return this.getDataFromResponse(response);
    }

    async getDataFromResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }
}

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
            localStorage.setItem("token", data.token);
            console.log("Token stored in local storage:", data.token);
            window.location.href = `${frontendAddress}/index.html`;
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async register(username, password) {
        const user = { username, password };
        try {
            const data = await this.httpServ.post("/register", user);
            localStorage.setItem("token", data.token);
            console.log("Token stored in local storage:", data.token);
            window.location.href = `${frontendAddress}/index.html`;
        } catch (error) {
            console.error("Error:", error);
        }
    }
}

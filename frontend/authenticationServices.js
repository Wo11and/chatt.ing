const frontendAddress = import.meta.env.VITE_FRONTEND_ADDRESS;
class httpService {
    constructor(url) {
        this.url = url;
    }

    async get(route, headers) {
        const response = await fetch(this.url + route, {
            method: "GET",
            headers,
        });

        return this.getDataFromResponse(response);
    }

    async post(route, headers, body) {
        const response = await fetch(this.url + route, {
            method: "POST",
            headers,
            body,
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

class Authentication {
    httpServ = new httpService("http://localhost:3000");

    // Get token from local storage, check it and return user info.
    // If no token or wrong token, throw error
    async authenticate() {
        try {
            const token = localStorage.getItem("token");
            const data = await httpServ.get("/", {
                Authorization: `Bearer ${token}`,
            });
            return data;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    async login(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        // Make a POST request to the server to register the user
        try {
            const data = await httpServ.post(
                "/login",
                {
                    "Content-Type": "application/json",
                },
                JSON.stringify(Object.fromEntries(formData))
            );
            console.log(data);
            localStorage.setItem("token", data.token);
            console.log("Token stored in local storage:", data.token);
            window.location.href = `${frontendAddress}/chat.html`;
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async register(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        // Make a POST request to the server to register the user
        try {
            const data = await httpServ.post(
                "/register",
                {
                    "Content-Type": "application/json",
                },
                JSON.stringify(Object.fromEntries(formData))
            );
            console.log(data);
            localStorage.setItem("token", data.token);
            console.log("Token stored in local storage:", data.token);
            window.location.href = `${frontendAddress}/chat.html`;
        } catch (error) {
            console.error("Error:", error);
        }
    }
}

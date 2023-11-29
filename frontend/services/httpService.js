export class httpService {
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

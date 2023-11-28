import { Authentication } from "../services/authenticationServices";
const auth = new Authentication();

async function register(event) {
    event.preventDefault();
    console.log("submitting...");
    const username = document.getElementById("login__username").value;
    const password = document.getElementById("login__password").value;
    if (!username || !password) {
        //...
    }
    const result = await auth.register(username, password);
    if (!result) {
        document.getElementById("login__username").value = "";
        document.getElementById("login__password").value = "";
    }
}

document.getElementById("registrationForm").addEventListener("submit", register);

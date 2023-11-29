import { Authentication } from "../services/authenticationServices";
const auth = new Authentication();

async function register(event) {
    event.preventDefault();
    console.log("submitting register event...");
    const username = document.getElementById("register__username").value;
    const password = document.getElementById("register__password").value;
    if (!username || !password) {
        //...
    }
    const result = await auth.register(username, password);
    if (!result) {
        document.getElementById("register__username").value = "";
        document.getElementById("register__password").value = "";
    }
}

document.getElementById("registrationForm").addEventListener("submit", register);

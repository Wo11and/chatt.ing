import { Authentication } from "../services/authenticationServices";
const auth = new Authentication();

function login(event) {
    event.preventDefault();
    console.log("submitting...");
    const username = document.getElementById("login__username").value;
    const password = document.getElementById("login__password").value;
    if (!username || !password) {
        //...
    }
    auth.login(username, password);
}

document.getElementById("registrationForm").addEventListener("submit", login);

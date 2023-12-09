import { Authentication } from "../services/authenticationServices";
const auth = new Authentication();

async function register(event) {
    event.preventDefault();
    document.getElementById("error__div").style.display = "none";
    document.getElementById("enter_both").style.display = "none";
    const username = document.getElementById("register__username").value;
    const password = document.getElementById("register__password").value;
    if (!username || !password) {
        document.getElementById("enter_both").style.display = "block";
        return;
    }
    const result = await auth.register(username, password);
    if (!result) {
        document.getElementById("register__username").value = "";
        document.getElementById("register__password").value = "";
    }
}

document
    .getElementById("registrationForm")
    .addEventListener("submit", register);

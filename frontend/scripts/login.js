import { Authentication } from "../services/authenticationServices";
const auth = new Authentication();

async function login(event) {
    event.preventDefault();
    document.getElementById("error__div").style.display = "none";
    document.getElementById("enter_both").style.display = "none";
    const username = document.getElementById("login__username").value;
    const password = document.getElementById("login__password").value;
    if (!username || !password) {
        document.getElementById("enter_both").style.display = "block";
        return;
    }
    const result = await auth.login(username, password);
    if (!result) {
        document.getElementById("login__username").value = "";
        document.getElementById("login__password").value = "";
    }
}

document.getElementById("registrationForm").addEventListener("submit", login);

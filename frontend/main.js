import { Authentication } from "./services/authenticationServices.js";
import "./sockets.js";

const token = localStorage.getItem("token");
const auth = new Authentication();

try {
    await auth.authenticate();
} catch (err) {
    //console.log(err);
    window.location.href = `${frontendAddress}/register.html`;
}
// socket.auth = { token };
// socket.connect();

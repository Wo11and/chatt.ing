import { Authentication } from "./services/authenticationServices.js";
import "./sockets.js";
const frontendAddress = import.meta.env.VITE_FRONTEND_ADDRESS;

const auth = new Authentication();

try {
    const data = await auth.authenticate();
    console.log(data);
} catch (err) {
    console.log(err);
    window.location.replace = `${frontendAddress}/login.html`;
}

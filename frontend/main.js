import { Authentication } from "./services/authenticationServices.js";
import { config } from "./config.js";

import "./sockets.js";

const auth = new Authentication();

try {
    const data = await auth.authenticate();
} catch (err) {
    console.log(err);
    window.location.replace(`${config.frontendAddress}/login.html`);
}

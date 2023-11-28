import "./sockets.js";

const token = localStorage.getItem("token");

//  TODO: Actually authenticate the user
// fetch("http://localhost:3000/", {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// 	.then((response) => response.json())
// 	.then((data) => console.log(data))
// 	.catch((error) => console.error("Error:", error));

// TODO: Authenticate user and get jwtToken
try {
    await auth.authenticate();
} catch (err) {
    //console.log(err);
    window.location.href = `${frontendAddress}/register.html`;
}
// socket.auth = { token };
// socket.connect();

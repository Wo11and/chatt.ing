# chatt.ing

Developing a simple web chat app for the <b>JS-Advanced</b> course. <br>

The app allows users to login and sign up for it. It also saves the login info with <b>hashed password</b> in a postgres database.

Upon logging in a user will be redirected to a page which display all currently active users.<br>
Selecting one will retrieve the chat history from a database (MongoDB).

Sending messages happens through web sockets.
All the information between the server and the frontend is encrypted with a symmetric key that only they have (currently in .env files).<br>
<br>
Every user has public and private RSA key (stored in the Postgre DB) and every message is being encrypted before being sent to the other user.
Also the messages are being encrypted with both of the public keys and a <b>Server side public key</b> (Again stored in .env) before being sent to the database.<br>
Attaching an image is also supported and encrypted using a symmetric key.

### Tech-stack used so far:

- Express
- Vite
- Knex
- MongoDB
- Postgres

### Sample mock-up:

![design](https://github.com/Wo11and/chatt.ing/assets/93873508/32e67ae5-0b4a-4c38-8c28-c76383028867)

### Future improvements:

- add support for files other than images
- create chat rooms for more than 2 people
- improve the index page?

import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: "3001",
    },
    build: {
        target: "esnext",

        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                login: resolve(__dirname, "login.html"),
                register: resolve(__dirname, "register.html"),
            },
        },
    },
    preview: {
        port: "3001",
    },
});

/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/modules/config/env";

let server: Server;

const stateServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL);
        console.log("Connected to DB!");

        server = app.listen(envVars.PORT, () => {
            console.log(`Server is listening to port http://localhost:${envVars.PORT}`)
        });
    } catch (error) {
        console.log(error);
    }
};
stateServer();

process.on("unhandledRejection", (err) => {
    console.log("unhandled rejection detracted .............Server shutting down", err);

    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }

    process.exit(1);
});

process.on("uncaughtException", (err) => {
    console.log("uncaught exception error........ server is shutting down", err);
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})

process.on("SIGTERM", () => {
    console.log("SIGTERM signal received .........server shutting down");
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})

process.on("SIGINT", () => {
    console.log("SIGINT signal received .........server shutting down");
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})

// unhandled rejection error
// Promise.reject(new Error("i forgot to catch this Promise"));

// uncaught rejection error
// throw new Error("I forgot to handle this local error");

// server error handling
/**
 * unhandled rejection error
 * uncaught rejection error
 * signal termination sigterm
 * 
 */

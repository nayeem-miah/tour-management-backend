import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";

let server: Server;

const stateServer = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/tour-management-backend")
        console.log("Connected to DB!");

        server = app.listen(5000, () => {
            console.log(`Server is listening to port http://localhost:5000`)
        });
    } catch (error) {
        console.log(error);
    }
};
stateServer();



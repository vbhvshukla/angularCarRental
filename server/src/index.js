import dotenv from "dotenv";
import { app } from "./app.js";
import connectDb from "./config/db.config.js"

/** Global Configuration :: dotENV */
dotenv.config({ path: ".env" })

/** DB Connection */
connectDb()
    .then(() => {
        app.listen(process.env.PORT || 8002, () => {
            console.log(`Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("DB Connection Error :: ", err);
    })


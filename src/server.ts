import express from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import todosRouter from "./routes/todos";
import session from "express-session";
config();

/** global constants declaration */
const port = process.env.PORT;
const connString =
  process.env.ENV === "DEV" ? process.env.DEV_CONN : process.env.PROD_CONN;
const secret = process.env.COOKIE_SECRET!;
const secure = process.env.ENV === "DEV" ? false : true;

// app initialization
const app = express();

// mongodb connection
connect(connString!, { dbName: "todo" })
  .then(() => {
    console.log("\x1b[35mConnected to db\x1b[0m");
  })
  .catch((err) => {
    console.log("\x1b[33mConnected to db\x1b[0m");
  });

// middleware
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(session({ cookie: { sameSite: "lax", secure }, secret }));

// routes
app.use("/todos", todosRouter);

// listen to server at port
app.listen(port, () => {
  console.log(`\x1b[33mhttp://localhost:${port}\x1b[0m`);
});

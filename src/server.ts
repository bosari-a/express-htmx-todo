import express from "express";
import { connect } from "mongoose";
import todosRouter from "./routes/todos";
import session from "express-session";
import MongoStore from "connect-mongo";
import morgan from "morgan";
import { connString, maxAge, port, secret } from "./utils/constants";
// app initialization
const app = express();

// mongodb connection
const clientP = connect(connString!, { dbName: "todo" }).then((m) => {
  console.log("\x1b[35mConnected to db\x1b[0m");
  // listen to server at port
  app.listen(port, () => {
    console.log(`\x1b[33mhttp://localhost:${port}\x1b[0m`);
  });
  return m.connection.getClient();
});
// dev middleware
app.use(morgan("dev"));
// middleware
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    cookie: {
      sameSite: "lax",
      secure: false,
      maxAge: maxAge,
    },
    secret: secret,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      clientPromise: clientP,
      dbName: "todo",
      stringify: false,
      autoRemove: "interval",
      autoRemoveInterval: maxAge / 60000,
      ttl: maxAge / 1000,
    }),
  })
);

// routes
app.use("/", todosRouter);

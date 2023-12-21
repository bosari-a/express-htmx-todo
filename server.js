import express, { Router } from 'express';
import { Schema, model, connect } from 'mongoose';
import { config } from 'dotenv';
import ejs from 'ejs';
import session from 'express-session';

var TodosSchema = new Schema({
    todo: { type: String, required: true },
    author: { type: String, required: true },
    done: { type: Boolean, required: true, default: false },
}, { collection: "todos" });

var todosModel = model("todos", TodosSchema, "todos");

/**
 *
 * @param req
 * @param res
 * @param next
 */
function getAllTodosMiddleware(req, res, next) {
    todosModel.find({}).then((todos) => {
        console.log(req.sessionID);
        res.locals = { todos };
        next();
    });
}
/**
 *
 * @param req
 * @param res
 */
function getAllTodos(req, res) {
    ejs
        .renderFile("./views/index.ejs", Object.assign({ title: "HTMX - Todo app" }, res.locals))
        .then((html) => {
        res.status(200).send(html);
    })
        .catch((err) => {
        console.log(err);
        res.status(500).send("500: Server error");
    });
}

const todosRouter = Router();
// middleware for GET "/"
todosRouter.get("/", getAllTodosMiddleware);
// response for GET "/"
todosRouter.get("/", getAllTodos);
// response for POST "/"
todosRouter.post("/");

config();
/** global constants declaration */
const port = process.env.PORT;
const connString = process.env.ENV === "DEV" ? process.env.DEV_CONN : process.env.PROD_CONN;
const secret = process.env.COOKIE_SECRET;
const secure = process.env.ENV === "DEV" ? false : true;
// app initialization
const app = express();
// mongodb connection
connect(connString, { dbName: "todo" })
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

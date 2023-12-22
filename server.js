import express, { Router } from 'express';
import { Schema, model, connect } from 'mongoose';
import ejs from 'ejs';
import { config } from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';

config();
/** global constants declaration */
const port = process.env.PORT;
const connString = process.env.ENV === "DEV" ? process.env.DEV_CONN : process.env.PROD_CONN;
const secret = process.env.COOKIE_SECRET;
const secure = process.env.ENV === "DEV" ? false : true;
const sameSite = process.env.ENV === "DEV" ? "lax" : true;
/** This value is in miliseconds */
const maxAge = 1000 * 60 * 60 * 24;

//import { maxAge } from "../utils/constants";
var TodosSchema = new Schema({
    todo: { type: String, required: true },
    sessionId: { type: String, required: true },
    done: { type: Boolean, required: true, default: false },
    expireAt: {
        type: Date,
        default: Date.now(),
        expires: maxAge / 1000,
    },
}, { collection: "todos" });

var todosModel = model("todos", TodosSchema, "todos");

/**
 *
 * @param req
 * @param res
 * @param next
 */
function getAllTodosMiddleware(req, res, next) {
    req.sessionStore.get(req.sessionID, (err, data) => {
        if (err) {
            res
                .status(500)
                .send("500: server error, failed to get cookies from store");
        }
        else if (!data) {
            res.locals = { todos: [] };
            next();
        }
        else if (data) {
            todosModel.find({ sessionId: req.sessionID }).then((todos) => {
                res.locals = { todos };
                next();
            });
        }
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
function postATodoMiddleware(req, res, next) {
    todosModel
        .create(Object.assign(Object.assign({}, req.body), { sessionId: req.sessionID }))
        .then((todo) => {
        res.locals = { todo };
        next();
    })
        .catch((err) => {
        console.log(err);
        res.status(500).send("Error: could not create todo :(");
    });
}
/**
 *
 * @param req
 * @param res
 */
function postATodo(req, res) {
    ejs
        .renderFile("./views/partials/todo.ejs", { todo: res.locals.todo })
        .then((html) => {
        res.status(200).send(html);
    })
        .catch((err) => {
        console.log(err);
        res.status(500).send("Error: could not create todo template :(");
    });
}

const todosRouter = Router();
// middleware for GET
todosRouter.get("/", getAllTodosMiddleware);
// response for GET
todosRouter.get("/", getAllTodos);
// middleware for POST
todosRouter.post("/", postATodoMiddleware);
// response for POST
todosRouter.post("/", postATodo);

// app initialization
const app = express();
// mongodb connection
const clientP = connect(connString, { dbName: "todo" }).then((m) => {
    console.log("\x1b[35mConnected to db\x1b[0m");
    return m.connection.getClient();
});
// middleware
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    cookie: {
        sameSite: sameSite,
        secure: secure,
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
        autoRemoveInterval: 10,
    }),
}));
// routes
app.use("/todos", todosRouter);
// listen to server at port
app.listen(port, () => {
    console.log(`\x1b[33mhttp://localhost:${port}\x1b[0m`);
});

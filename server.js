import express, { Router } from 'express';
import { Schema, model, connect } from 'mongoose';
import ejs from 'ejs';
import { config } from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import morgan from 'morgan';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

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
}, { collection: "todos", timestamps: true });

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
            todosModel
                .find({ sessionId: req.sessionID })
                .sort({ createdAt: -1 })
                .then((todos) => {
                res.locals = {
                    todos: todos,
                };
                next();
            })
                .catch((err) => {
                console.log(err);
                res.status(500).send("500: Server error, could not fetch db");
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
/**
 *
 * @param req
 * @param res
 * @param next
 */
function postATodoMiddleware(req, res, next) {
    todosModel
        .create(Object.assign(Object.assign({}, req.body), { sessionId: req.sessionID }))
        .then((todo) => {
        res.locals = { todo: todo.toObject() };
        next();
    })
        .catch((err) => {
        console.log(err);
        res.status(400).header({ "HX-Reswap": "innerHTML" }).send(err.message);
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
/**
 *
 * @param req
 * @param res
 */
function patchATodoMiddleware(req, res, next) {
    const _a = req.body, { _id } = _a, update = __rest(_a, ["_id"]);
    todosModel
        .findOneAndUpdate({ _id }, update, { new: true })
        .then((updatedTodo) => {
        if (!updatedTodo)
            throw Error("could not update todo :(");
        res.locals = { todo: updatedTodo.toObject() };
        next();
    })
        .catch((err) => {
        res
            .status(400)
            .header({ "HX-Refresh": true })
            .send(err.message || "an error occurred while updating todo");
    });
}
/**
 *
 * @param req
 * @param res
 */
function patchATodo(req, res) {
    if (req.body.todo)
        ejs
            .renderFile("./views/partials/todo.ejs", { todo: res.locals.todo })
            .then((html) => {
            res.status(200).send(html);
        })
            .catch((err) => {
            res.status(500).send(err.message || "Server error");
        });
    else if (req.body.done)
        res.status(200).end();
}
function deleteATodo(req, res) {
    todosModel
        .findByIdAndDelete({ _id: req.body._id })
        .then((deleted) => {
        if (!deleted)
            throw Error("could not delete document :(");
        res.status(200).send("");
    })
        .catch((err) => {
        res.status(400).send(err.message || "could not delete document :(");
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
// middleware for PATCH
todosRouter.patch("/", patchATodoMiddleware);
// response for PATCH
todosRouter.patch("/", patchATodo);
// response for DELETE
todosRouter.delete("/", deleteATodo);

// app initialization
const app = express();
// mongodb connection
const clientP = connect(connString, { dbName: "todo" }).then((m) => {
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
        autoRemoveInterval: maxAge / 60000,
        ttl: maxAge / 1000,
    }),
}));
// routes
app.use("/todos", todosRouter);

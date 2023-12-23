import { NextFunction, Request, Response } from "express";
import ejs from "ejs";
import todosModel from "../model/todosModel";

/**
 *
 * @param req
 * @param res
 * @param next
 */
export function getAllTodosMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.sessionStore.get(req.sessionID, (err, data) => {
    if (err) {
      res
        .status(500)
        .send("500: server error, failed to get cookies from store");
    } else if (!data) {
      res.locals = { todos: [] };
      next();
    } else if (data) {
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
export function getAllTodos(req: Request, res: Response) {
  ejs
    .renderFile("./views/index.ejs", {
      title: "HTMX - Todo app",
      ...res.locals,
    })
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
export function postATodoMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  todosModel
    .create({ ...req.body, sessionId: req.sessionID })
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
export function postATodo(req: Request, res: Response) {
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
export function patchATodoMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { _id, ...update } = req.body;
  todosModel
    .findOneAndUpdate({ _id }, update, { new: true })
    .then((updatedTodo) => {
      if (!updatedTodo) throw Error("could not update todo :(");
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
export function patchATodo(req: Request, res: Response) {
  if (req.body.todo)
    ejs
      .renderFile("./views/partials/todo.ejs", { todo: res.locals.todo })
      .then((html) => {
        res.status(200).send(html);
      })
      .catch((err) => {
        res.status(500).send(err.message || "Server error");
      });
  else if (req.body.done) res.status(200).end();
}
export function deleteATodo(req: Request, res: Response) {
  todosModel
    .findByIdAndDelete({ _id: req.body._id })
    .then((deleted) => {
      if (!deleted) throw Error("could not delete document :(");
      res.status(200).send("");
    })
    .catch((err) => {
      res.status(400).send(err.message || "could not delete document :(");
    });
}

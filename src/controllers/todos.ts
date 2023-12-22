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
export function postATodoMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  todosModel
    .create({ ...req.body, sessionId: req.sessionID })
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

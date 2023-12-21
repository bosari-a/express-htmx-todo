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

export function postATodo(req: Request, res: Response) {}

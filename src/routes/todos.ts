import { Router } from "express";
import {
  getAllTodos,
  getAllTodosMiddleware,
  postATodo,
  postATodoMiddleware,
} from "../controllers/todos";

const todosRouter = Router();

// middleware for GET
todosRouter.get("/", getAllTodosMiddleware);
// response for GET
todosRouter.get("/", getAllTodos);

// middleware for POST
todosRouter.post("/", postATodoMiddleware);
// response for POST
todosRouter.post("/", postATodo);

export default todosRouter;

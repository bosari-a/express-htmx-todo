import { Router } from "express";
import { getAllTodos, getAllTodosMiddleware } from "../controllers/todos";

const todosRouter = Router();

// middleware for GET "/"
todosRouter.get("/", getAllTodosMiddleware);
// response for GET "/"
todosRouter.get("/", getAllTodos);

// response for POST "/"
todosRouter.post("/")


export default todosRouter;

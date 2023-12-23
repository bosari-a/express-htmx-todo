import { Router } from "express";
import {
  deleteATodo,
  getAllTodos,
  getAllTodosMiddleware,
  patchATodo,
  patchATodoMiddleware,
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

// middleware for PATCH
todosRouter.patch("/", patchATodoMiddleware);

// response for PATCH
todosRouter.patch("/", patchATodo);

// response for DELETE
todosRouter.delete("/", deleteATodo);

export default todosRouter;

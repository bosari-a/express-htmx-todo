import { model } from "mongoose";
import TodosSchema from "./TodosSchema";

export default model("todos", TodosSchema, "todos");

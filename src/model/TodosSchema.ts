import { Schema } from "mongoose";

export default new Schema(
  {
    todo: { type: String, required: true },
    author: { type: String, required: true },
    done: { type: Boolean, required: true, default: false },
  },
  { collection: "todos" }
);

import { Schema } from "mongoose";
import { maxAge } from "../utils/constants";
//import { maxAge } from "../utils/constants";

export default new Schema(
  {
    todo: { type: String, required: true },
    sessionId: { type: String, required: true },
    done: { type: Boolean, required: true, default: false },
    expireAt: {
      type: Date,
      default: Date.now(),
      expires: maxAge / 1000,
    },
  },
  { collection: "todos", timestamps: true }
);

import { config } from "dotenv";

config();

/** global constants declaration */
export const port = process.env.PORT;
export const connString =
  process.env.ENV === "DEV" ? process.env.DEV_CONN : process.env.PROD_CONN;
export const secret = process.env.COOKIE_SECRET!;
/** This value is in miliseconds */
export const maxAge = 1000 * 60 * 60 * 24;

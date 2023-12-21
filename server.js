import express from 'express';
import ejs from 'ejs';
import { config } from 'dotenv';

config();
const app = express();
// middleware
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    ejs
        .renderFile("./views/index.ejs", { title: "HTMX - Todo app" })
        .then((html) => {
        res.status(200).send(html);
    })
        .catch((err) => {
        console.log(err);
        res.status(500).send("500: Server error");
    });
});
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`\x1b[33mhttp://localhost:${port}\x1b[0m`);
});

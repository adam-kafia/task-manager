const express = require("express");
require("./db/mongoose");

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT;
//console.log(process.env);

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => console.log("Server up and running on port " + port));

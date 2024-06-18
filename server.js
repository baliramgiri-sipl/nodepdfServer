const express = require('express');
const app = express();
require("dotenv").config();

const port = process.env.PORT || 3548;
app.use(express.json({ limit: "50mb" }));


app.use("/api", require("./Route/taxCertRoute"));

//lareta html to pdf conversion router
app.use("/api",require("./Route/laretaCertRoute"));

app.listen(port, () => console.log(`listening on ${port} `));
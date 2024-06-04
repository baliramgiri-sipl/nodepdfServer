const express = require('express');
const app = express();
require("dotenv").config()

const port = process.env.PORT || 4000
app.use(express.json({ limit: "50mb" }))

app.use("/api", require("./Route/taxCertRoute"))
app.listen(port, () => console.log(`listening on ${port} `));
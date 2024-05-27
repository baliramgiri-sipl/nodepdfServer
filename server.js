const express = require('express');
const app = express();
const port = process.env.PORT || 4000
app.use(express.json())
app.use("/api", require("./Route/taxCertRoute"))
app.listen(port, () => console.log(`listening on ${port} `));
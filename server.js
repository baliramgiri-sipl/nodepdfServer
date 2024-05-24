const express = require('express');
const app = express();

app.use(express.json())
app.use("/api/pdf", require("./Route/pdfRoute"))
app.use("/api/pdf", require("./Route/hoaRoute"))
app.use("/api/merge", require("./Route/hoaRoute"))
app.listen(4000, () => console.log('listening on 4000 port'));
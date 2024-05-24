const express = require('express');
const app = express();

app.use(express.json())
app.use("/api", require("./Route/taxCertRoute"))
app.listen(4000, () => console.log('listening on 4000 port'));
const path = require("path");
const express = require("express");

const staticServer = express();
const app = express();

staticServer.use(express.static("build"));
// staticServer.listen(3001); 
staticServer.listen(3002);

app.use(express.static("build"));
app.get("/*", function(req, res) {
  res.sendFile(path.resolve(__dirname, `build/index.html`));
});

app.listen(3000);

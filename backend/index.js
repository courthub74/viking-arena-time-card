// API
const express = require("express");

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Viking Arena Time Card API is running.");
});

app.listen(port, () => {
  console.log(
    `Viking Arena Time Card API is running on http://localhost:${port}`,
  );
});

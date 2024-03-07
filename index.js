const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const hpp = require("hpp");
const compression = require("compression");
const nodeCron = require("node-cron")
const { scrapeLogic } = require("./scrapeLogic");
const app = express();

const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "*"
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(hpp())
app.use(compression())
app.use(morgan(':method :url :status :response-time ms'))

app.get("/api/pdf", (req, res) => {
  scrapeLogic(res);
});

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
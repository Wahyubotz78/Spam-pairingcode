const express = require("express");
const chalk = require("chalk");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const stats = require("./lib/stats");

const PORT = process.env.PORT || 8080;
const app = express();

const mainRoutes = require("./routes/main");
const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/static", express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use((req, res, next) => {
  stats.incrementRequests();
  const ip = req.ip;
  console.log(chalk.blue(`IP: ${ip}, Request Path: ${req.path}, Total Requests: ${stats.getRequestCount()}`));
  next();
});

app.use((req, res, next) => {
  stats.incrementVisitors();
  console.log(chalk.green(`Total Visitors: ${stats.getVisitorCount()}`));
  next();
});

app.use("/", mainRoutes);
app.use("/api", apiRoutes);
app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

app.use((req, res) => {
  res.status(404).send("Halaman tidak ditemukan");
});

app.listen(PORT, () => {
  console.log(chalk.green(`Server running on http://localhost:${PORT}`));
});
const express = require("express");
const path = require("path");
const { authenticate } = require('../lib/function');
const stats = require('../lib/stats');

const router = express.Router();
const app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get('/dashboard', authenticate, (req, res) => {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();
  const hours = today.getHours().toString().padStart(2, '0');
  const minutes = today.getMinutes().toString().padStart(2, '0');
  const seconds = today.getSeconds().toString().padStart(2, '0');
  const time = `${hours}:${minutes}:${seconds}`;

  res.render('dashboard', {
    uniqueCode: req.user.uniqueCode,
    totalVisitors: stats.getVisitorCount(),
    totalRequests: stats.getRequestCount(),
    currentDate: `${day} ${month} ${year}`,
    currentTime: time
  });
});

module.exports = router;
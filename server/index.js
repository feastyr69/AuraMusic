const express = require("express");
const session = require("express-session");
const apiRouter = require("./routes/apiRoutes");
const connectIO = require("./sockets/chatSocket");
const { connectRedis } = require("./config/redis");
const cors = require("cors");

const io = require("socket.io")(3000, {
  cors: {
    origin: "http://localhost:5173"
  },
});

const { initDb } = require("./database/db");
initDb();

//databaseConnection();
connectRedis();
connectIO(io);

const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: false,
  },
}));


const authRouter = require("./routes/authRoutes");
const passport = require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRouter);
app.use("/api", apiRouter);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

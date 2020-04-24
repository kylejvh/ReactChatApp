const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const path = require("path");
const chatroomRouter = require("./routes/chatroomRoutes");
const chatMessageRouter = require("./routes/chatMessageRoutes");
const userRouter = require("./routes/userRoutes");
const premiumRouter = require("./routes/premiumRoutes");

const app = express();
//* 1. GLOBAL MIDDLEWARES

//!  IMPLEMENT CORS - ADJUST AS NEEDED FOR PRODUCTION
// Currently set to all domains - Access-Control-Allow-Origin *

// Must use withCredentials for JWT cookie
// But you cannot use cors() with withCredentials
// So what are my options? Whitelist only?

// Send JWT over headers only??

// if (process.env.NODE_ENV === "production") {
//   app.use(cors());
// } else if (process.env.NODE_ENV === "development") {
//   const whitelist = [
//     "http://localhost:3000",
//     "http://127.0.0.1:3100",
//     "http://192.168.1.181:3000",
//     "https://kjvh-materialchat.herokuapp.com/",
//   ];
//   const corsOptions = {
//     origin: function (origin, callback) {
//       if (whitelist.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   };

//   app.use(cors());
// }

// Handle CORS pre-flight phase
// app.options("*", cors(corsOptions));

// Set security HTTP headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//TODO: You may need to change this for a chat application...
// Limit a connection to 1000 requests per hour
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP.\n Please try again in an hour.",
});
app.use("/api", limiter);

// Body parser, reads data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// TODO: edit whitelist
// Prevent parameter pollution with whitelist exceptions
app.use(
  hpp({
    whitelist: ["duration"],
  })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//* 2. MOUNTING ROUTERS
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chatrooms", chatroomRouter);
app.use("/api/v1/messages", chatMessageRouter);
app.use("/api/v1/premium", premiumRouter);

// Server static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "./client/build")));

  app.get("*", function (_, res) {
    res.sendFile(path.join(__dirname, "./client/build/index.html"), function (
      err
    ) {
      if (err) {
        res.status(500).send(err);
      }
    });
  });
}

module.exports = app;

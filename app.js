const express = require("express");
const csrf = require("tiny-csrf");
const app = express();
const { Admin } = require("./models");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
//const connectEnsureLogin = require("connect-ensure-login");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");

//const saltRounds = 10;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.use(flash());

app.use(express.static(path.join(__dirname, "public")));

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

app.use(connectLiveReload());

app.use(
  session({
    secret: "my-super-secret-key-21728172615261562",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (email, password, done) => {
      Admin.findOne({ where: { email } })
        .then(async (user) => {
          if (!user) {
            return done(null, false, { message: "Incorrect username." });
          }
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Incorrect password." });
          }
        })
        .catch((err) => {
          done(err, null);
        });
    }
  )
);

passport.serializeAdmin((user, done) => {
  done(null, user.id);
});

passport.deserializeAdmin((id, done) => {
  Admin.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  // if (req.user && req.user.id) {
  //     res.redirect("/todos");
  // } else {
  //     res.render("index", { csrfToken: req.csrfToken() });
  // }
  res.render("index", { csrfToken: req.csrfToken() });
});

app.get("/login", (request, response) => {
  response.render("login", { csrfToken: request.csrfToken(), title: "Login" });
});

module.exports = app;

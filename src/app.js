const express = require("express");
const csrf = require("tiny-csrf");
const app = express();
const { Admin } = require("../models");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");
const sqlite = require("better-sqlite3");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const moment = require("moment");

const csrfToken = process.env.CSRF_TOKEN || "this_should_be_32_character_long";
const sessionKey =
    process.env.SESSION_KEY || "my-super-secret-key-21728172615261562";

const SqliteStore = require("better-sqlite3-session-store")(session);
const db = new sqlite("sessions.db");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh"));
app.use(csrf(csrfToken, ["POST", "PUT", "DELETE"]));
app.use(flash());

app.use(express.static(path.join(__dirname, "../public")));

if (process.env.DLR !== "true") {
    const liveReloadServer = livereload.createServer();
    liveReloadServer.server.once("connection", () => {
        setTimeout(() => {
            liveReloadServer.refresh("/");
        }, 100);
    });
    app.use(connectLiveReload());
} else {
    console.log("Live reload is disabled");
}

app.use(
    session({
        store: new SqliteStore({
            client: db,
            expired: {
                clear: true,
                intervalMs: 900000,
            },
        }),
        secret: sessionKey,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
        },
        resave: false,
        saveUninitialized: false,
    })
);

app.use(function (request, response, next) {
    response.locals.messages = request.flash();
    response.locals.moment = moment;
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
                        return done(null, false, {
                            message:
                                "An Account with this email does not exist",
                        });
                    }
                    const result = await bcrypt.compare(
                        password,
                        user.password
                    );
                    if (result) {
                        return done(null, user);
                    } else {
                        return done(null, false, {
                            message: "Incorrect password.",
                        });
                    }
                })
                .catch((err) => {
                    done(err, null);
                });
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    Admin.findByPk(id)
        .then((user) => {
            done(null, user);
        })
        .catch((err) => {
            done(err, null);
        });
});

app.set("view engine", "ejs");

require("./routes")(app, passport);

app.get("/", (req, res) => {
    if (req.user && req.user.id) {
        res.redirect("/elections");
    } else {
        res.render("index", { csrfToken: req.csrfToken() });
    }
});

module.exports = app;

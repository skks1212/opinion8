const bcrypt = require("bcrypt");
const { Admin } = require("../../models");
module.exports = function (app, passport) {
    const saltRounds = 10;

    app.get("/login", (request, response) => {
        response.render("login", {
            csrfToken: request.csrfToken(),
            title: "Login",
        });
    });

    app.get("/register", (request, response) => {
        response.render("register", {
            csrfToken: request.csrfToken(),
            title: "Register",
        });
    });

    app.post(
        "/login",
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        (request, response) => {
            response.redirect("/elections");
        }
    );

    app.post("/register", async (request, response) => {
        const { name, email, password } = request.body;

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            const user = await Admin.createUser({
                name,
                email,
                password: hashedPassword,
            });
            request.logIn(user, (err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                response.redirect("elections");
            });
        } catch (error) {
            error.errors.forEach((element) => {
                request.flash("error", element.message);
            });
            response.redirect("register");
        }
    });

    app.get("/logout", (request, response) => {
        request.logout((err) => {
            if (err) {
                /* eslint-disable no-undef */
                return next(err);
            }
            response.redirect("/");
        });
    });
};

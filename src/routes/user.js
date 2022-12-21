const bcrypt = require("bcrypt");
const { Admin } = require("../../models");
const ensureLoggedIn = require("../utils/ensureLoggedIn");
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
        passport.authenticate("AdminLocal", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        (request, response) => {
            response.redirect("/elections");
        }
    );

    app.post("/register", async (request, response) => {
        const { name, email, password, password2 } = request.body;

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            if (password.length < 8) {
                request.flash(
                    "error",
                    "Password must be at least 8 characters"
                );
                response.redirect("register");
                return;
            }
            if (password !== password2) {
                request.flash("error", "Passwords do not match");
                response.redirect("register");
                return;
            }
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

    app.get("/profile", ensureLoggedIn(), (request, response) => {
        response.render("profile", {
            csrfToken: request.csrfToken(),
            title: "Profile",
        });
    });

    app.post("/profile", ensureLoggedIn(), async (request, response) => {
        const { password, password2 } = request.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
            if (password.length < 8) {
                request.flash(
                    "error",
                    "Password must be at least 8 characters"
                );
                response.redirect("profile");
                return;
            }
            if (password !== password2) {
                request.flash("error", "Passwords do not match");
                response.redirect("profile");
                return;
            }
            const user = await Admin.updatePassword(
                hashedPassword,
                request.user.id
            );
            request.logIn(user, (err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                request.flash("success", "Password updated");
                response.redirect("profile");
            });
        } catch (error) {
            console.log(error);
            error?.errors?.forEach((element) => {
                request.flash("error", element.message);
            });
            response.redirect("profile");
        }
    });
};

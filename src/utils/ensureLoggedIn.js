module.exports = function ensureLoggedIn(t, options) {
    const type = t || "Admin";

    if (typeof options == "string") {
        options = { redirectTo: options };
    }
    options = options || {};

    var url = options.redirectTo || "/login";
    var setReturnTo =
        options.setReturnTo === undefined ? true : options.setReturnTo;

    return function (req, res, next) {
        const isAdmin =
            req.user && req.user.id && typeof req.user.voterId === "undefined";
        if (type === "Admin" && !isAdmin) {
            return res.redirect(url);
        }

        if (type === "Voter" && isAdmin) {
            return res.redirect((req.originalUrl || req.url) + "/voter-login");
        }
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            if (setReturnTo && req.session) {
                req.session.returnTo = req.originalUrl || req.url;
            }

            if (type === "Admin") {
                return res.redirect(url);
            } else {
                return res.redirect(
                    (req.originalUrl || req.url) + "/voter-login"
                );
            }
        }
        res.locals.user = req.user;
        next();
    };
};

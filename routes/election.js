const { Election } = require("../models");

module.exports = (app, passport, connectEnsureLogin) => {
    app.get(
        "/elections",
        connectEnsureLogin.ensureLoggedIn(),
        async (request, response) => {
            const myElections = await Election.getElections(request.user.id);
            response.render("elections", {
                title: "My Elections",
                csrfToken: request.csrfToken(),
                elections: myElections,
            });
        }
    );
};

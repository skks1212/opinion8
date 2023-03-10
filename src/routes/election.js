const { Election, Vote } = require("../../models");
const ensureLoggedIn = require("../utils/ensureLoggedIn");
const { usedRoutes } = require("../utils/urls");

module.exports = (app) => {
    app.get("/elections", ensureLoggedIn(), async (request, response) => {
        const myElections = await Election.getElections(request.user.id);
        const ongoing = myElections.filter((e) => e.status == 1);
        const upcoming = myElections.filter((e) => e.status == 0 || !e.status);
        const past = myElections.filter((e) => e.status == 2);
        response.render("elections", {
            title: "My Elections",
            csrfToken: request.csrfToken(),
            elections: myElections,
            ongoing,
            upcoming,
            past,
        });
    });

    app.post("/elections", ensureLoggedIn(), async (request, response) => {
        const { name } = request.body;
        const election = await Election.createElection(name, request.user.id);
        response.redirect(`/elections/${election.id}`);
    });

    app.get("/elections/:id", ensureLoggedIn(), async (request, response) => {
        const { id } = request.params;
        try {
            const election = await Election.getElection(id, request.user.id);
            const votes = await Vote.getResults(id, request.user.id);
            response.render("election", {
                title: election.name,
                csrfToken: request.csrfToken(),
                election,
                votes,
            });
        } catch (error) {
            console.error(error);
            response.redirect("/elections");
        }
    });

    app.patch("/elections/:id", ensureLoggedIn(), async (request, response) => {
        const { id } = request.params;
        const { name, status, customUrl } = request.body;
        const usedR = usedRoutes(app);
        try {
            if (customUrl && usedR.includes(customUrl)) {
                throw {
                    errors: [{ message: "Custom URL has already been taken" }],
                };
            }
            await Election.updateElection(
                id,
                { name, status, customUrl },
                request.user.id
            );
            if (request.accepts("json")) {
                response.json({ success: true });
            } else {
                response.redirect(`/elections/${id}`);
            }
        } catch (error) {
            error?.errors?.forEach((element) => {
                request.flash("error", element.message);
            });
            if (request.accepts("json")) {
                response
                    .status(400)
                    .json({ success: false, errors: error.errors });
            } else {
                response.redirect(`/elections/${id}`);
            }
        }
    });

    app.delete(
        "/elections/:id",
        ensureLoggedIn(),
        async (request, response) => {
            try {
                const { id } = request.params;
                await Election.deleteElection(id, request.user.id);
                if (request.accepts("json")) {
                    response.json({ success: true });
                } else {
                    response.redirect(`/elections/${id}`);
                }
            } catch (error) {
                if (request.accepts("json")) {
                    response
                        .status(400)
                        .json({ success: false, errors: error.errors });
                } else {
                    error.errors.forEach((element) => {
                        request.flash("error", element.message);
                    });
                    response.redirect("/");
                }
            }
        }
    );

    app.get(
        "/elections/:id/preview",
        ensureLoggedIn(),
        async (request, response) => {
            const { id } = request.params;
            try {
                const election = await Election.getElection(
                    id,
                    request.user.id
                );
                response.render("preview", {
                    title: election.name,
                    csrfToken: request.csrfToken(),
                    election,
                });
            } catch (error) {
                console.error(error);
                response.redirect("/elections");
            }
        }
    );
};

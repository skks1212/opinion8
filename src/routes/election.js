const { Election } = require("../../models");
const ensureLoggedIn = require("../utils/ensureLoggedIn");

module.exports = (app) => {
    app.get("/elections", ensureLoggedIn(), async (request, response) => {
        const myElections = await Election.getElections(request.user.id);
        const ongoing = myElections.filter((e) => e.status == 1);
        const upcoming = myElections.filter((e) => e.status == 0 || !e.status);
        const past = myElections.filter((e) => e.status == 2);
        console.log(myElections.map((e) => e.startDate));
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
        const election = await Election.getElection(id, request.user.id);
        response.render("election", {
            title: election.name,
            csrfToken: request.csrfToken(),
            election,
        });
    });

    app.patch("/elections/:id", ensureLoggedIn(), async (request, response) => {
        const { id } = request.params;
        const { name, status } = request.body;
        try {
            await Election.updateElection(
                id,
                { name, status },
                request.user.id
            );

            if (request.accepts("json")) {
                response.json({ success: true });
            } else {
                response.redirect(`/elections/${id}`);
            }
        } catch (error) {
            console.log(error);
            error.errors.forEach((element) => {
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
                console.log(error);
                error.errors.forEach((element) => {
                    request.flash("error", element.message);
                });
                response.redirect("/todos");
            }
        }
    );
};

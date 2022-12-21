const { Election, Vote } = require("../../models");
const ensureLoggedIn = require("../utils/ensureLoggedIn");

module.exports = (app, passport) => {
    app.get(
        "/:election",
        ensureLoggedIn("Voter"),
        async (request, response) => {
            const { election } = request.params;
            const user = request.user;
            const electionDetails = await Election.getElectionInfoForVoter(
                election,
                user.voterId
            );
            const votes = await Vote.getVotes(electionDetails.id, user.id);
            const results = await Vote.getResults(electionDetails.id);
            if (!electionDetails) {
                request.flash("error", "Election not found");
                return response.status(404).render("404");
            }
            response.render("vote/vote", {
                title: electionDetails.name,
                csrfToken: request.csrfToken(),
                election: electionDetails,
                votes,
                results,
            });
        }
    );
    app.get("/:election/voter-login", async (request, response) => {
        const { election } = request.params;
        const electionDetails = await Election.getElectionInfo(election);
        response.render("vote/voter-login", {
            csrfToken: request.csrfToken(),
            election: electionDetails,
            title: "Voter Login",
        });
    });

    app.post(
        "/:election/voter-login",
        passport.authenticate("VoterLocal", {
            failureRedirect: "voter-login",
            failureFlash: true,
        }),
        (request, response) => {
            const { election } = request.params;
            response.redirect(`/${election}`);
        }
    );

    app.post(
        "/:election",
        ensureLoggedIn("Voter"),
        async (request, response) => {
            const { election } = request.params;
            /* eslint-disable no-unused-vars */
            const { _csrf, ...votes } = request.body;
            const user = request.user;
            try {
                const v = await Vote.createVotes(election, user.id, votes);
                console.log(v);
            } catch (error) {
                console.log(error);
                error?.errors.forEach((err) => {
                    request.flash("error", err.message);
                });
                return response.redirect("/" + election);
            }
            request.flash("success", "Vote cast successfully");
            response.redirect("/" + election);
        }
    );
};

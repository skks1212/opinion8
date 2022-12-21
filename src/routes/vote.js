const { Election } = require("../../models");
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
            if (!electionDetails) {
                request.flash("error", "Election not found");
                return response.status(404).render("404");
            }
            response.render("vote/vote", {
                title: electionDetails.name,
                csrfToken: request.csrfToken(),
                election: electionDetails,
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
};

//const { Election } = require("../../models");
//const ensureLoggedIn = require("../utils/ensureLoggedIn");
//const { usedRoutes } = require("../utils/urls");

module.exports = (app) => {
    app.get("/:election", async (request, response) => {
        //const { election } = request.params;
        //const electionDetails = await Voter.getElection(election);
        response.render("vote/vote", {
            //title: electionDetails.name,
            //csrfToken: request.csrfToken(),
            //election: electionDetails,
        });
    });
};

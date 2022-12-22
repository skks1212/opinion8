const { Voter } = require("../../models");
const ensureLoggedIn = require("../utils/ensureLoggedIn");

module.exports = (app) => {
    app.post("/elections/:id/voters", ensureLoggedIn(), async (req, res) => {
        const { id } = req.params;
        const { voterId, password } = req.body;
        try {
            await Voter.createVoter({ voterId, password }, id, req.user.id);
        } catch (error) {
            //console.log(error);
            error.errors?.forEach((element) => {
                req.flash("error", element.message);
            });
        }
        res.redirect(`/elections/${id}`);
    });
    app.post(
        "/elections/:id/voters/:vId",
        ensureLoggedIn(),
        async (req, res) => {
            const { id, vId } = req.params;
            const { voterId, password } = req.body;
            try {
                await Voter.updateVoter(
                    { voterId, password },
                    vId,
                    req.user.id
                );
            } catch (error) {
                //console.log(error);
                error.errors?.forEach((element) => {
                    req.flash("error", element.message);
                });
            }
            res.redirect(`/elections/${id}`);
        }
    );
    app.delete(
        "/elections/:id/voters/:vId",
        ensureLoggedIn(),
        async (req, res) => {
            const { vId } = req.params;
            try {
                await Voter.deleteVoter(vId, req.user.id);
                res.json({ success: true });
            } catch (error) {
                //console.log(error);
                res.status(400).json({ success: false, errors: error.errors });
            }
        }
    );
};

const { Question } = require("../../models");
const ensureLoggedIn = require("../utils/ensureLoggedIn");
module.exports = (app) => {
    app.post(
        "/elections/:id/questions",
        ensureLoggedIn(),
        async (request, response) => {
            const { id } = request.params;
            const { question, description } = request.body;
            await Question.createQuestion(
                { question, description },
                id,
                request.user.id
            );
            response.redirect(`/elections/${id}`);
        }
    );
};

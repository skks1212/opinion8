const { Question, Option } = require("../../models");
const ensureLoggedIn = require("../utils/ensureLoggedIn");
module.exports = (app) => {
    app.post(
        "/elections/:id/questions",
        ensureLoggedIn(),
        async (request, response) => {
            const { id } = request.params;
            const { question, description } = request.body;
            try {
                await Question.createQuestion(
                    { question, description },
                    id,
                    request.user.id
                );
            } catch (error) {
                error.errors?.forEach((element) => {
                    request.flash("error", element.message);
                });
            }
            response.redirect(`/elections/${id}`);
        }
    );
    app.patch(
        "/elections/:id/questions/:questionId",
        ensureLoggedIn(),
        async (request, response) => {
            const { questionId } = request.params;
            const { question, description } = request.body;
            try {
                const q = await Question.updateQuestion(
                    { question, description },
                    questionId,
                    request.user.id
                );
                response.json({ success: true, question: q });
            } catch (error) {
                response
                    .status(400)
                    .json({ success: false, errors: error.errors });
            }
        }
    );
    app.delete(
        "/elections/:id/questions/:questionId",
        ensureLoggedIn(),
        async (request, response) => {
            const { id, questionId } = request.params;
            try {
                await Question.deleteQuestion(questionId, request.user.id);
                response.json({ success: true });
            } catch (error) {
                console.log(error);
                error.errors?.forEach((element) => {
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
        }
    );
    app.post(
        "/elections/:id/questions/:questionId/options",
        ensureLoggedIn(),
        async (request, response) => {
            const { id, questionId } = request.params;
            const { option } = request.body;
            try {
                const op = await Option.createOption(
                    { option },
                    questionId,
                    request.user.id
                );
                console.log("------------- ", op);
            } catch (error) {
                error.errors?.forEach((element) => {
                    request.flash("error", element.message);
                });
                console.log(error);
            }
            response.redirect(`/elections/${id}`);
        }
    );
    app.patch(
        "/elections/:id/questions/:questionId/options/:optionId",
        ensureLoggedIn(),
        async (request, response) => {
            const { optionId } = request.params;
            const { option } = request.body;
            try {
                const o = await Option.updateOption(
                    { option },
                    optionId,
                    request.user.id
                );
                response.json(o);
            } catch (error) {
                response
                    .status(400)
                    .json({ success: false, errors: error.errors });
            }
        }
    );
    app.delete(
        "/elections/:id/questions/:questionId/options/:optionId",
        ensureLoggedIn(),
        async (request, response) => {
            const { id, optionId } = request.params;
            try {
                await Option.deleteOption(optionId, request.user.id);
                response.json({ success: true });
            } catch (error) {
                console.log(error);
                error.errors?.forEach((element) => {
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
        }
    );
};

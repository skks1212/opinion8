/* eslint-disable no-undef */
const db = require("../models");
const request = require("supertest");
const app = require("../src/app");

let server, agent;

describe("Handle all voter features", function () {
    beforeAll(async () => {
        await db.sequelize.sync({ force: true });
        server = app.listen(5000);
        agent = request.agent(server);
        await register(agent, "john@doe.com", "John Doe", "12345678");
        await setupElection(agent);
    });
    afterAll(async () => {
        try {
            await db.sequelize.close();
            await server.close();
        } catch (error) {
            console.log(error);
        }
    });
    test("Visit Election", async () => {
        let res = await agent.get("/e/1");
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/e/1/voter-login");
        res = await agent.get("/e/test");
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/e/test/voter-login");
    });
    test("Login as voter", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.post("/e/test/voter-login").send({
            voterId: "testvoter",
            password: "123456",
            electionId: 1,
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("voter-login");
        csrfToken = await getCSRFToken(agent);
        res = await agent.post("/e/test/voter-login").send({
            voterId: "testvoter1",
            password: "123456",
            _csrf: csrfToken,
            electionId: 1,
        });
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/e/test");
    });
    test("Vote", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.post("/e/test").send({
            question_1: 1,
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/e/test");
        csrfToken = await getCSRFToken(agent);
        res = await agent.post("/e/test").send({
            question_1: 1,
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/e/test");
    });
});

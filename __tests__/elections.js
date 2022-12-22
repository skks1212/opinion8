/* eslint-disable no-undef */
const db = require("../models");
const request = require("supertest");
const app = require("../src/app");

let server, agent;

describe("Handle all election features", function () {
    beforeAll(async () => {
        await db.sequelize.sync({ force: true });
        server = app.listen(5000);
        agent = request.agent(server);
        await register(agent, "john@doe.com", "John Doe", "12345678");
        await register(agent, "jane@doe.com", "Jane Doe", "12345678");
    });
    afterAll(async () => {
        try {
            await db.sequelize.close();
            await server.close();
        } catch (error) {
            console.log(error);
        }
    });

    test("Create election", async () => {
        await login(agent, "john@doe.com", "12345678");
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.post("/elections").send({
            name: "John's Test Election",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/elections/1");
    });

    test("Update election", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.patch("/elections/1").send({
            name: "Test Election",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(200);
    });

    test("Update election with invalid details", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.patch("/elections/1").send({
            name: "",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(400);
        csrfToken = await getCSRFToken(agent);
        res = await agent.patch("/elections/1").send({
            name: "Test Election",
            customUrl: "T1",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(400);
    });

    test("Start election with no questions", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.patch("/elections/1").send({
            status: 1,
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(400);
    });

    test("Add question to election", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.post("/elections/1/questions").send({
            question: "Test Question",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/elections/1");
    });

    test("Update question", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.patch("/elections/1/questions/1").send({
            question: "",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(400);
        csrfToken = await getCSRFToken(agent);
        res = await agent.patch("/elections/1/questions/1").send({
            question: "Test Question",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(200);
    });

    test("Add option to question", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.post("/elections/1/questions/1/options").send({
            option: "Test Option",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/elections/1");
    });

    test("Update option", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.patch("/elections/1/questions/1/options/1").send({
            option: "",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(400);
        csrfToken = await getCSRFToken(agent);
        res = await agent.patch("/elections/1/questions/1/options/1").send({
            option: "Test Option",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(200);
    });

    test("Delete option", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent
            .delete("/elections/1/questions/1/options/1")
            .send({
                _csrf: csrfToken,
            });
        expect(res.statusCode).toEqual(200);
        csrfToken = await getCSRFToken(agent);
        res = await agent.delete("/elections/1/questions/1/options/2").send({
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(400);
    });

    test("Delete question", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.delete("/elections/1/questions/1").send({
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(200);
        csrfToken = await getCSRFToken(agent);
        res = await agent.post("/elections/1/questions").send({
            question: "Test Question",
            _csrf: csrfToken,
        });
    });

    test("Start election without voters", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.patch("/elections/1").send({
            status: 1,
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(400);
    });

    test("Add voter to election", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.post("/elections/1/voters").send({
            voterId: "testvoter1",
            password: "123456",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/elections/1");
        csrfToken = await getCSRFToken(agent);
        res = await agent.post("/elections/1/voters").send({
            voterId: "testvoter2",
            password: "123",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/elections/1");
    });

    test("Update voter", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.post("/elections/1/voters/1").send({
            voterId: "test1",
            password: "12345",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/elections/1");
    });

    test("Delete voter", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.delete("/elections/1/voters/1").send({
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(200);
    });

    test("Start election", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.patch("/elections/1").send({
            status: 1,
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(200);
    });

    test("View Someone Else's Election", async () => {
        await logout(agent);
        await login(agent, "jane@doe.com", "12345678");
        let res = await agent.get("/elections/1");
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/elections");
    });

    test("Update Someone Else's Election", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.patch("/elections/1").send({
            name: "Test Election",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(400);
    });

    test("Delete Someone Else's Election", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.delete("/elections/1").send({
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(400);
    });
});

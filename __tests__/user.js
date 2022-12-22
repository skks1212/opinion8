/* eslint-disable no-undef */
const db = require("../models");
const request = require("supertest");
const app = require("../src/app");

let server, agent;

describe("Handle all user features", function () {
    beforeAll(async () => {
        await db.sequelize.sync({ force: true });
        server = app.listen(5000);
        agent = request.agent(server);
    });
    afterAll(async () => {
        try {
            await db.sequelize.close();
            await server.close();
        } catch (error) {
            console.log(error);
        }
    });

    test("Sign Up John Doe", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.post("/register").send({
            email: "john@doe.com",
            name: "John Doe",
            password: "12345678",
            password2: "12345678",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("elections");
    });
    test("Sign Up John Doe again", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.post("/register").send({
            email: "john@doe.com",
            name: "John Doe",
            password: "12345678",
            password2: "12345678",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("register");
    });
    test("Sign Up Jane Doe", async () => {
        let csrfToken = await getCSRFToken(agent);
        let res = await agent.post("/register").send({
            email: "jane@doe.com",
            name: "Jane Doe",
            password: "12345678",
            password2: "12345678",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("elections");
    });
    test("Change Password", async () => {
        let res = await login(agent, "john@doe.com", "12345678");
        let csrfToken = await getCSRFToken(agent);
        res = await agent.post("/profile").send({
            password: "87654321",
            password2: "87654321",
            _csrf: csrfToken,
        });
        expect(res.statusCode).toEqual(302);
        await logout(agent);
        res = await login(agent, "john@doe.com", "12345678");
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/login");
        res = await login(agent, "john@doe.com", "87654321");
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("/elections");
    });
});

/* eslint-disable no-undef */
global.getCSRFToken = async (agent) => {
    const response = await agent.get("/csrf");
    return response.body.csrfToken;
};

global.login = async (agent, email, password) => {
    const csrfToken = await getCSRFToken(agent);
    return await agent.post("/login").send({
        email,
        password,
        _csrf: csrfToken,
    });
};

global.register = async (agent, email, name, password) => {
    const csrfToken = await getCSRFToken(agent);
    return await agent.post("/register").send({
        email,
        name,
        password,
        password2: password,
        _csrf: csrfToken,
    });
};

global.setupElection = async (agent) => {
    let csrfToken = await getCSRFToken(agent);
    await agent.post("/elections").send({
        name: "Test Election",
        _csrf: csrfToken,
    });
    csrfToken = await getCSRFToken(agent);
    await agent.post("/elections/1/questions").send({
        question: "Test Question",
        _csrf: csrfToken,
    });
    csrfToken = await getCSRFToken(agent);
    await agent.post("/elections/1/voters").send({
        voterId: "testvoter1",
        password: "123456",
        _csrf: csrfToken,
    });
    csrfToken = await getCSRFToken(agent);
    await agent.post("/elections/1/voters").send({
        voterId: "testvoter2",
        password: "123456",
        _csrf: csrfToken,
    });
    csrfToken = await getCSRFToken(agent);
    await agent.patch("/elections/1").send({
        status: 1,
        customUrl: "test",
        _csrf: csrfToken,
    });
};

global.logout = async (agent) => {
    const res = await agent.get("/logout");
    return res;
};

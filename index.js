const app = require("./app");
const port = typeof process.env.PORT !== "undefined" ? process.env.PORT : 3000;

app.listen(port, () => {
    console.log("Started express server at port " + port);
});

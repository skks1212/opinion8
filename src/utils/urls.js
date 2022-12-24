const allRoutes = (app) =>
    app._router.stack
        .map((r) => {
            if (r.route && r.route.path) {
                return r.route.path;
            }
        })
        .filter((r) => r != undefined);

const usedRoutes = (app) => {
    const routes = allRoutes(app);
    const used = [];
    routes.forEach((route) => {
        const paths = route.split("/");
        const path = paths[1];
        if (
            !used.includes(path) &&
            path?.startsWith(":") == false &&
            path != ""
        ) {
            used.push(path);
        }
    });
    return used;
};

module.exports = { allRoutes, usedRoutes };

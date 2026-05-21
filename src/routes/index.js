const apiRoute = require ('./api');

function route(app) {
    app.use('/api/v1', apiRoute);

    app.use((req,res) => {
        res.status(404).json({error: "Endpont not found"});
    });
}

module.exports = route;
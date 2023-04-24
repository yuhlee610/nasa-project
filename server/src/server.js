const http = require("http");
require('dotenv').config();

const app = require("./app");
const PORT = process.env.PORT || 8080;
const { loadPlanetsModel } = require("./models/planets.model");
const { mongoConnect } = require("./services/mongo");
const { loadLaunchData } = require('./models/launches.model');

const server = http.createServer(app);

async function startSever() {
  await mongoConnect();
  await loadPlanetsModel();
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

startSever();

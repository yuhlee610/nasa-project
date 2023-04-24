const {
  getAllLaunches,
  addNewLaunch,
  isLaunchExist,
  abortLaunch,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }

  if (new Date(launch.launchDate).toString() === "Invalid Date") {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }

  const dbLaunch = await addNewLaunch(launch);
  res.status(201).json(dbLaunch);
}

async function httpAbortLaunch(req, res) {
  const id = +req.params.id;
  const existsLaunch = await isLaunchExist(id);

  if (!existsLaunch) {
    return res.status(404).json({ error: "Not found" });
  }

  await abortLaunch(id);
  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};

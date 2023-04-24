const dbLaunches = require("./launches.mongo");
const dbPlanets = require("./planets.mongo");
const axios = require("axios");

const DEFAULT_FLIGHT_NUMBER = 100;

async function getLatestFlightNumber() {
  const latestLaunch = await dbLaunches.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await dbLaunches
    .find(
      {},
      {
        __v: 0,
        _id: 0,
      }
    )
    .sort({
      flightNumber: -1
    })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  await dbLaunches.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
    }
  );
}

async function addNewLaunch(launch) {
  const planet = await dbPlanets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error("No matching planet found");
  }

  const latestFlightNumber = await getLatestFlightNumber();
  const newFlightNumber = latestFlightNumber + 1;
  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    upcoming: true,
    success: true,
    customers: ["Zero to Mastery", "NASA"],
    launchDate: new Date(launch.launchDate),
  });

  await saveLaunch(newLaunch);
  return newLaunch;
}

async function isLaunchExist(id) {
  return await findLaunch({ flightNumber: id });
}

async function abortLaunch(id) {
  const aborted = await dbLaunches.updateOne(
    {
      flightNumber: id,
    },
    {
      success: false,
      upcoming: false,
    }
  );
}

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch data already loaded");
    return;
  } else {
    await populateLaunch();
  }
}

async function populateLaunch() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  const launchData = response.data.docs;

  const data = launchData.map((launchDoc) => {
    const payloads = launchDoc["payloads"];
    const customer = payloads.flatMap((payload) => payload["customers"]);
    return {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"] || true,
      customer,
    };
  });
  await dbLaunches.insertMany(data);
}

async function findLaunch(filter) {
  return await dbLaunches.findOne(filter);
}

module.exports = {
  getAllLaunches,
  addNewLaunch,
  isLaunchExist,
  abortLaunch,
  loadLaunchData,
};

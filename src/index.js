const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const moment = require("moment");
const os = require("os");

dotenv.config();

const ONE_HOUR = 60 * 60 * 1000;

const axiosInstance = axios.create({
  baseURL: "https://lichess.org/api",
  headers: {
    Authorization: `Bearer ${process.env.LICHESS_API_ACCESS_TOKEN}`,
  },
});

const now = () => moment().toISOString();
const waitFor = (inMs) => new Promise((resolve) => setTimeout(resolve, inMs));

async function createClassicalArenaTournament(customData) {
  try {
    // https://lichess.org/api#operation/apiTournamentPost
    const data = {
      ...customData,
      clockTime: 30,
      clockIncrement: 0,
      minutes: 720,
      conditions: {
        ...customData.conditions,
        teamMember: {
          teamId: "world-classicals",
        },
        nbRatedGame: {
          nb: 10,
        },
      },
    };

    await axiosInstance.post("/tournament", data);

    console.log(
      now(),
      `${moment(customData.startDate).toISOString()} ${
        customData.name
      } Arena created.`
    );
  } catch (err) {
    console.log(
      now(),
      `${moment(customData.startDate).toISOString()} ${
        customData.name
      } Arena creation failed...`
    );
    console.log(now(), `[createClassicalArenaTournament()] Error: ${err}`);
    console.log(err.response.data);
  }

  await waitFor(5000);
}

async function createAllClassicalArenaTournamentsAt(startDate) {
  // Elite Classical Arena
  await createClassicalArenaTournament({
    name: "Elite Classical",
    description: `Rating above 2200 in Classical. Please check our other tournaments if your rating doesn't match!`,
    startDate,
    berserkable: true,
    conditions: {
      minRating: {
        rating: 2200,
      },
    },
  });

  // U2200 Classical Arena
  await createClassicalArenaTournament({
    name: "U2200 Classical",
    description: `Rating between 1800 & 2200 in Classical. Please check our other tournaments if your rating doesn't match!`,
    startDate,
    berserkable: true,
    conditions: {
      minRating: {
        rating: 1800,
      },
      maxRating: {
        rating: 2200,
      },
    },
  });

  // U1800 Classical Arena
  await createClassicalArenaTournament({
    name: "U1800 Classical",
    description: `Rating between 1500 & 1800 in Classical. Please check our other tournaments if your rating doesn't match!`,
    startDate,
    berserkable: false,
    conditions: {
      minRating: {
        rating: 1500,
      },
      maxRating: {
        rating: 1800,
      },
    },
  });

  // U1500 Classical Arena
  await createClassicalArenaTournament({
    name: "U1500 Classical",
    description: `Rating under 1500 in Classical. Please check our other tournaments if your rating doesn't match!`,
    startDate,
    berserkable: false,
    conditions: {
      maxRating: {
        rating: 1500,
      },
    },
  });
}

async function createOpenClassicalSwissTournament(startsAt) {
  // https://lichess.org/api#tag/Swiss-tournaments
  const data = {
    name: "Open Classical Swiss",
    description: `Daily Swiss Tournament open to everybody. Please check our daily rating-dedicated Arena Tournaments if you prefer those.`,
    clock: {
      limit: 1800,
      increment: 0,
    },
    nbRounds: 3,
    startsAt,
    chatFor: 30,
  };

  try {
    await axiosInstance.post("/swiss/new/world-classicals", data);

    console.log(
      now(),
      `${moment(data.startsAt).toISOString()} ${data.name} created.`
    );
  } catch (err) {
    console.log(
      now(),
      `${moment(data.startsAt).toISOString()} ${data.name} creation failed...`
    );
    console.log(now(), `[createOpenClassicalSwissTournament()] Error: ${err}`);
    console.log(err.response.data);
  }
}

async function start() {
  try {
    const { data } = await axiosInstance.get("/team/world-classicals/arena");

    const currentArenas = data
      .split(/\n/)
      .reduce((currentArenas, arenaJson) => {
        try {
          currentArenas.push(JSON.parse(arenaJson.trim()));
        } catch (err) {}

        return currentArenas;
      }, []);

    const nonTeamBattleCurrentArenas = currentArenas.filter(
      ({ teamBattle }) => teamBattle === undefined
    );

    const lastCurrentArenasDate = nonTeamBattleCurrentArenas
      .map(({ startsAt }) => startsAt)
      .sort()
      .reverse()[0];

    const todayAt0000 = Number(
      moment().utc().hour(0).minute(0).second(0).milliseconds(0).format("x")
    );
    const todayAt0600 = todayAt0000 + 6 * ONE_HOUR;
    const todayAt1800 = todayAt0000 + 18 * ONE_HOUR;

    if (todayAt0600 > lastCurrentArenasDate) {
      await createAllClassicalArenaTournamentsAt(todayAt0600);
    }

    if (todayAt1800 > lastCurrentArenasDate) {
      await createAllClassicalArenaTournamentsAt(todayAt0600);
    }
  } catch (err) {
    console.log(now(), `[start()] Error: ${err}`);
  }
}

start();

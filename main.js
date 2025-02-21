import "dotenv/config";

import ms from "ms";

import * as ParserFromObject from "./parsers/from-object.js";
import * as ParserFromYaml from "./parsers/from-yaml.js";
import * as StrategyFullSafe from "./strategies/full-safe.js";
import { logObject, logParsed } from "./log.js";
import { getMe } from "./youtrack-api/index.js";

const CURRENT_FILE = process.env.CURRENT_FILE;
const ENABLE_LOG = true;

const processFullSafe = async (now) => {
  const file = `${CURRENT_FILE}.yaml`;
  const data = await ParserFromYaml.load(file);

  const parsedSource = ParserFromYaml.parse(data);
  const parsedFormat = ParserFromObject.parse(parsedSource);

  if (ENABLE_LOG) {
    await logParsed(now, `${file}.s-0:0.parsed`, parsedFormat);
  }

  const me = await getMe();

  if (ENABLE_LOG) {
    await logObject(now, `${file}.s-0:1.get-me`, { me });
  }

  let strategyLogName = null;
  if (ENABLE_LOG) {
    strategyLogName = `${file}.s-1:`;
  }

  if (process.env.NODE_ENV === "production") {
    const sleepTime = "5s";
    const sleepTimeMs = ms(sleepTime);
    console.log(
      `!!! DANGER: PRODUCTION MODE RUN, sleep(${sleepTime}) :: CALL:processFullSafe`
    );
    await new Promise((resolve) => setTimeout(resolve, sleepTimeMs));
  }

  await StrategyFullSafe.run(strategyLogName, me, parsedFormat);
};

const main = async () => {
  const now = new Date();

  console.log();
  console.log();

  if (process.env.NODE_ENV === "production") {
    const sleepTime = "5s";
    const sleepTimeMs = ms(sleepTime);
    console.log(
      `!!! DANGER: PRODUCTION MODE RUN, sleep(${sleepTime}) :: CALL:main`
    );
    await new Promise((resolve) => setTimeout(resolve, sleepTimeMs));
  }

  await processFullSafe(now);
};

main();

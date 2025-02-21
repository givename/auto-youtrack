import * as fs from "fs/promises";
import { stringify } from "yaml";

import { FOLDER_LOGS, FOLDER_LOGS_HISTORY } from "./constants.js";

export const logObject = async (now, filename, object) => {
  const yaml = stringify(object);
  const yamlFilename = `${+now}-${filename}`;

  await fs.writeFile(`${FOLDER_LOGS}/${yamlFilename}.yaml`, yaml, "utf8");

  if (process.env.NODE_ENV === "production") {
    await fs.writeFile(
      `${FOLDER_LOGS_HISTORY}/${yamlFilename}.yaml`,
      yaml,
      "utf8"
    );
  }
};

export const logParsed = async (now, filename, object) => {
  const contentForYaml = {};
  for (const day of object) {
    for (const [date, times] of Object.entries(day)) {
      const timeForYaml = {};

      for (const time of times) {
        timeForYaml[time.task] = time;
      }

      contentForYaml[date] = timeForYaml;
    }
  }

  const yaml = stringify(contentForYaml);
  const yamlFilename = `${+now}-${filename}`;

  await fs.writeFile(`${FOLDER_LOGS}/${yamlFilename}.yaml`, yaml, "utf8");

  if (process.env.NODE_ENV === "production") {
    await fs.writeFile(
      `${FOLDER_LOGS_HISTORY}/${yamlFilename}.yaml`,
      yaml,
      "utf8"
    );
  }
};

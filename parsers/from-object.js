import ms from "ms";
import { z } from "zod";

import { FULL_WORK_DAY_MS } from "../constants.js";

const DAY_SCHEMA = z.object({
  task: z.number(),
  taskUrl: z.string(),
  time: z.string(),
  content: z.string(),
  date: z.string(),
});

const DAYS_SCHEMA = z.array(z.record(z.string(), z.array(DAY_SCHEMA)));

export const parse = (unknown) => {
  const parsedFormat = DAYS_SCHEMA.parse(unknown);

  for (const parsedItem of parsedFormat) {
    const [day, items] = Object.entries(parsedItem).at(0);

    let timeMsDay = 0;
    for (const item of items) {
      const { time } = item;

      const timeMs = ms(time);

      timeMsDay += timeMs;
    }

    const diffMs = Math.abs(timeMsDay - FULL_WORK_DAY_MS);
    const min10Ms = ms("10m");

    if (diffMs > min10Ms) {
      throw new Error(
        `Day ${day} has ${diffMs} ms diff, but should be ${FULL_WORK_DAY_MS}`
      );
    }
  }

  return parsedFormat;
};

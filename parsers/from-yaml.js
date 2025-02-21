import * as fs from "fs/promises";
import * as yaml from "yaml";
import ms from "ms";

import {
  TASK_FOR_MEET,
  CURRENT_YEAR,
  FOLDER_FROM_YAML,
  FULL_WORK_DAY_MS,
} from "../constants.js";

const timeMsToTimeMin = (timeMs) => `${Math.floor(timeMs / 60000)}m`;

export const load = async (filename) => {
  const path = `${FOLDER_FROM_YAML}/${filename}`;
  const data = await fs.readFile(path, "utf8");
  return data;
};

export const parse = (text) => {
  const textWithoutTabs = text.replace(/\t/g, " ");
  const parsed = yaml.parse(textWithoutTabs);

  const days = [];

  for (const [dateReport, dayReport] of Object.entries(parsed)) {
    const dateWithYear = `${dateReport}.${CURRENT_YEAR}`;

    const date = dateWithYear;

    let lostTimeMs = FULL_WORK_DAY_MS;
    let taskCount = 0;
    let taskWithTimeCount = 0;

    const meetTimes = [];

    const taskPreparatoryTimes = {};
    const taskPreparatoryContent = {};
    const taskTimes = [];

    for (const [taskNumberString, task] of Object.entries(dayReport["Tasks"])) {
      const taskNumber = Number(taskNumberString);
      const title = task["title"];
      const rawDesc = task["desc"];

      const optionalDesc = typeof rawDesc === "string" ? [rawDesc] : rawDesc;
      const desc = optionalDesc ?? [];
      const descContent = desc.map((line) => `\n  ${line}`).join("");

      const taskContent = `${taskNumber} - ${title}:${descContent}`;

      taskPreparatoryContent[taskNumber] = taskContent;
      taskPreparatoryTimes[taskNumber] = null;

      taskCount += 1;
    }

    for (const [timeString, variant] of Object.entries(dayReport["Times"])) {
      const timeMs = ms(timeString);
      const timeMin = timeMsToTimeMin(timeMs);
      const type = variant["type"];

      if (type === "meet") {
        const name = variant["name"];

        const meetContent = `${timeMin}: ${name}`;

        const meetTime = {
          timeMs: timeMs,
          content: meetContent,
        };

        lostTimeMs -= timeMs;
        meetTimes.push(meetTime);
      } else if (type === "task") {
        const taskNumber = Number(variant["task"]);

        taskWithTimeCount += 1;
        lostTimeMs -= timeMs;
        taskPreparatoryTimes[taskNumber] = timeMs;
      }
    }

    const averageTimeMsOnUntrackedTask =
      lostTimeMs / (taskCount - taskWithTimeCount);

    for (const [taskNumberString, maybeTimeMs] of Object.entries(
      taskPreparatoryTimes
    )) {
      const taskNumber = Number(taskNumberString);
      const timeMs = maybeTimeMs ?? averageTimeMsOnUntrackedTask;
      const timeMin = timeMsToTimeMin(timeMs);

      const taskContent = `${timeMin}: ${taskPreparatoryContent[taskNumber]}`;

      const taskTime = {
        task: taskNumber,
        taskUrl: `https://youtrack.bkgn.su/issue/BC-${taskNumber}/`,
        time: timeMin,
        content: taskContent,
      };

      taskTimes.push(taskTime);
    }

    let timeMsOnMeets = 0;
    for (const meetTime of meetTimes) {
      timeMsOnMeets += meetTime.timeMs;
    }

    const meetTime = {
      task: TASK_FOR_MEET,
      taskUrl: `https://youtrack.bkgn.su/issue/BC-${TASK_FOR_MEET}/`,
      time: timeMsToTimeMin(timeMsOnMeets),
      content: meetTimes.map((meetTime) => meetTime.content).join("\n"),
    };

    const times = taskTimes.concat(meetTime).map((time) => {
      const timeWithDate = {
        date,
        ...time,
      };

      return timeWithDate;
    });

    const day = {
      [`${date}`]: times,
    };

    days.push(day);
  }

  return days;
};

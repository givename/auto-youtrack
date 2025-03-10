import moment from "moment-timezone";
import ms from "ms";

import { YOUTRACK_BASE_URL, YOUTRACK_TOKEN } from "../constants.js";

const CURRENT_TIME_ZONE = moment.tz.guess();

const throwIfError = (json) => {
  const { error, error_description } = json;
  if (error || error_description) {
    throw new Error(`${error}: ${error_description}`);
  }
};

export const getMe = async () => {
  const route = "users/me?fields=id,email,login";

  const response = await fetch(`${YOUTRACK_BASE_URL}/${route}`, {
    headers: {
      Authorization: `Bearer ${YOUTRACK_TOKEN}`,
    },
  });

  const json = await response.json();
  throwIfError(json);

  const { id, email, login } = json;

  const result = { id, email, login };

  return result;
};

export const getWorkItems = async (
  taskNumber,
  options = {
    filterByCreatorId: null,
    filterByMarkedDays: null,
  }
) => {
  const taskId = `BC-${taskNumber}`;
  const route = `issues/${taskId}/timeTracking?fields=draftWorkItem(id),workItems(date,text,created,duration(presentation,minutes),creator(id),updated,id)`;
  const response = await fetch(`${YOUTRACK_BASE_URL}/${route}`, {
    headers: {
      Authorization: `Bearer ${YOUTRACK_TOKEN}`,
    },
  });

  const { filterByCreatorId, filterByMarkedDays } = options;

  const json = await response.json();
  throwIfError(json);

  const { workItems } = json;
  const result = [];

  for (const workItem of workItems) {
    const { id, duration, creator, created, updated, date, text } = workItem;
    const { minutes } = duration;
    const { id: creatorId } = creator;

    const durationMs = minutes * 60 * 1000;
    const createdAt = moment(created).toDate();
    const updatedAt = updated ? moment(updated).toDate() : null;
    const markedDay = moment(date).format("DD.MM.YYYY");

    const $metadata = {
      createdAt: moment(createdAt).format("DD.MM.YYYY"),
      markedAt: new Date(date),
      text,
    };

    const resultItem = {
      workItemId: id,
      creatorId,
      durationMs,
      createdAt,
      updatedAt,
      markedDay,
      $metadata,
    };

    result.push(resultItem);
  }

  let mutFilteredResult = result;

  if (filterByCreatorId) {
    mutFilteredResult = mutFilteredResult.filter(
      ({ creatorId }) => creatorId === filterByCreatorId
    );
  }
  if (filterByMarkedDays) {
    mutFilteredResult = mutFilteredResult.filter(({ markedDay }) =>
      filterByMarkedDays.includes(markedDay)
    );
  }

  return mutFilteredResult;
};

export const insertWorkItem = async (taskNumber, workItem) => {
  const taskId = `BC-${taskNumber}`;
  const route = `issues/${taskId}/timeTracking/workItems?fields=author(id,name),creator(id,name),date,duration(id,minutes,presentation),id,name,text,type(id,name)`;

  const { content, creatorId, markedDay, time } = workItem;

  const markedAt = moment(markedDay, "DD.MM.YYYY").utc().toDate();
  const timeMs = ms(time);
  const timeMin = Math.floor(timeMs / 60 / 1000);

  const offsetMs = moment.tz(CURRENT_TIME_ZONE).utcOffset() * 60 * 1000;
  const markedTimestamp = markedAt.getTime() + offsetMs;

  const requestBody = {
    usesMarkdown: true,
    text: content,
    date: markedTimestamp,
    author: {
      id: creatorId,
    },
    duration: {
      minutes: timeMin,
    },
  };

  const response = await fetch(`${YOUTRACK_BASE_URL}/${route}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${YOUTRACK_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const json = await response.json();
  throwIfError(json);

  const { id } = json;

  const result = { id };

  return result;
};

export const deleteWorkItem = async (taskNumber, workItemId) => {
  const taskId = `BC-${taskNumber}`;
  const route = `issues/${taskId}/timeTracking/workItems/${workItemId}`;

  const response = await fetch(`${YOUTRACK_BASE_URL}/${route}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${YOUTRACK_TOKEN}`,
    },
  });

  const json = await response.json();
  const isEmptyJson = Boolean(json);

  if (isEmptyJson) {
    return;
  }

  throwIfError(json);
};

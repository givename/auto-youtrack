import "dotenv/config";

import * as yaml from "yaml";

import { deleteWorkItem } from "../youtrack-api/index.js";

const document = `

`;

const parsedDocument = yaml.parse(document);
const tasks = Object.values(parsedDocument).flat();
const workItemIds = tasks.map(({ workItemId, task: taskNumber }) => {
  const result = {
    workItemId,
    taskNumber,
  };

  return result;
});

async function main() {
  for (const { workItemId, taskNumber } of workItemIds) {
    try {
      console.error(`rollback: taskNumber=${taskNumber} workItemId=${workItemId} - init`);

      await deleteWorkItem(taskNumber, workItemId);

      console.error(`rollback: taskNumber=${taskNumber} workItemId=${workItemId} - success`);
    } catch (error) {
      console.error(
        `rollback: taskNumber=${taskNumber} workItemId=${workItemId} - error: ${error?.name}`,
        error
      );
    }
  }
}

main();
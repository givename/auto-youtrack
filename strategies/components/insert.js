import { insertWorkItem } from "../../youtrack-api/index.js";

export const insertWorkItems = async (me, parsedFormat, options = {}) => {
  const { id: creatorId } = me;
  const { ignoreErrors = false } = options;

  const success = new Map();
  const errors = new Map();

  let doStop = false;

  for (const parsedItem of parsedFormat) {
    if (doStop) {
      break;
    }

    const [, items] = Object.entries(parsedItem).at(0);

    for (const item of items) {
      if (doStop) {
        break;
      }

      const { task, taskUrl, time, content, date } = item;

      try {
        let insertedWorkItem;

        if (process.env.NODE_ENV === "production") {
          insertedWorkItem = await insertWorkItem(task, {
            creatorId,
            markedDay: date,
            time,
            content,
          });
        } else {
          insertedWorkItem = {
            id: `meta-${task}`,
          };
        }

        const { id } = insertedWorkItem;

        const result = {
          task,
          taskUrl,
          date,
          workItemId: id,
          time,
        };

        const successItems = success.get(task) || [];
        success.set(task, successItems);
        successItems.push(result);
      } catch (error) {
        const result = {
          task,
          taskUrl,
          date,
          error: `INSERT_WORK_ITEMS: ${error?.message || "Unexpected error"}`,
        };

        const errorItems = errors.get(task) || [];
        errors.set(task, errorItems);
        errorItems.push(result);

        if (false === ignoreErrors) {
          doStop = true;
        }
      }
    }
  }

  const isAllSuccess = !errors.size;
  const result = {
    success,
    errors,
    isAllSuccess,
  };

  return result;
};

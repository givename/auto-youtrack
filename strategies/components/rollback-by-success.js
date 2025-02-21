import { deleteWorkItem } from "../../youtrack-api/index.js";

export const deleteWorkItemsSuccess = async (itemsSuccess) => {
  const success = new Map();
  const errors = new Map();

  for (const [task, items] of itemsSuccess) {
    const workItemIds = [];

    for (const { taskUrl, date, workItemId } of items) {
      try {
        if (process.env.NODE_ENV === "production") {
          await deleteWorkItem(task, workItemIds);
        }

        const result = {
          task,
          taskUrl,
          date,
          workItemId,
        };

        const successItems = success.get(task) || [];
        success.set(task, successItems);
        successItems.push(result);
      } catch (error) {
        const result = {
          task,
          taskUrl,
          date,
          workItemId,
          error: `ROLLBACK_BY_SUCCESS: ${error?.message || "Unexpected error"}`,
        };

        const errorItems = errors.get(task) || [];
        errors.set(task, errorItems);
        errorItems.push(result);
      }
    }
  }

  const result = {
    success,
    errors,
  };

  return result;
};

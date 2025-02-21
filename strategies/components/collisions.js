import { getWorkItems } from "../../youtrack-api/index.js";

export const getCollisionWorkItems = async (me, parsedFormat) => {
  const { id } = me;
  const collisions = new Map();

  const usedTasks = new Set();
  const usedDays = new Set();

  for (const parsedItem of parsedFormat) {
    const [, items] = Object.entries(parsedItem).at(0);

    for (const { task, date } of items) {
      usedTasks.add(task);
      usedDays.add(date);
    }
  }

  for (const task of usedTasks) {
    const workItems = await getWorkItems(task, {
      filterByCreatorId: id,
      filterByMarkedDays: Array.from(usedDays),
    });

    if (workItems.length > 0) {
      collisions.set(task, workItems);
    }
  }

  return collisions;
};

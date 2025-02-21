import { getCollisionWorkItems } from "./components/collisions.js";
import { insertWorkItems } from "./components/insert.js";
import { deleteWorkItemsSuccess } from "./components/rollback-by-success.js";
import { logObject } from "../log.js";

export const run = async (logName, me, parsedFormat) => {
  const collisions = await getCollisionWorkItems(me, parsedFormat);

  if (logName && collisions.size > 0) {
    await logObject(
      new Date(),
      `${logName}0.collisions-error`,
      Object.fromEntries(collisions)
    );
  }

  if (collisions.size > 0) {
    throw new Error("FULL_SAFE: collisions detected, you need to fix them");
  }

  const {
    success: insertSuccess,
    errors: insertErrors,
    isAllSuccess: isAllInsertSuccess,
  } = await insertWorkItems(me, parsedFormat, {
    ignoreErrors: false,
  });

  if (logName && isAllInsertSuccess) {
    await logObject(
      new Date(),
      `${logName}1.insert-success`,
      Object.fromEntries(insertSuccess)
    );
  }

  if (isAllInsertSuccess) {
    return;
  }

  if (logName) {
    await logObject(
      new Date(),
      `${logName}1.insert-errors`,
      Object.fromEntries(insertErrors)
    );
  }

  const { success: deleteSuccess, errors: deleteErrors } =
    await deleteWorkItemsSuccess(insertSuccess);

  if (logName && deleteSuccess.size > 0) {
    await logObject(
      new Date(),
      `${logName}2.rollback-success`,
      Object.fromEntries(deleteSuccess)
    );
  }

  if (logName && deleteErrors.size > 0) {
    await logObject(
      new Date(),
      `${logName}2.rollback-errors`,
      Object.fromEntries(deleteErrors)
    );
  }

  throw new Error(
    "FULL_SAFE: insert errors, you need to fix them and rollback by success"
  );
};

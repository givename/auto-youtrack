import ms from "ms";

export const YOUTRACK_BASE_URL = process.env.YOUTRACK_BASE_URL;
export const YOUTRACK_TOKEN = process.env.YOUTRACK_TOKEN;

export const FOLDER_FROM_YAML = "reports-from-yaml";
export const FOLDER_LOGS = "logs";
export const FOLDER_LOGS_HISTORY = "logs-history";

export const TASK_FOR_MEET = process.env.YOUTRACK_TASK_FOR_MEET;
export const FULL_WORK_DAY_MS = ms(process.env.YOUTRACK_FULL_WORK_DAY);
export const CURRENT_YEAR = new Date().getFullYear();

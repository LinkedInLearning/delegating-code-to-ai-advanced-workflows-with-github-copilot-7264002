import fs from "node:fs";
import path from "node:path";

export type LogRecord = Record<string, unknown> & {
  ts: string;
  requestId: string;
  route: string;
  event: string;
};

function ensureLogsDir() {
  const dir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function logToFile(record: Omit<LogRecord, "ts">) {
  const dir = ensureLogsDir();
  const line = JSON.stringify({ ts: new Date().toISOString(), ...record });
  fs.appendFileSync(path.join(dir, "app.log"), line + "\n", "utf-8");
}

export function newRequestId() {
  return `req_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

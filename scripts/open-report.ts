// /scripts/open-report.ts

import { exec } from "node:child_process";
import path from "node:path";

const reportPath = path.resolve("coverage/index.html");

function openFile(filePath: string) {
  switch (process.platform) {
    case "win32":
      exec(`start "" "${filePath}"`);
      break;
    case "darwin":
      exec(`open "${filePath}"`);
      break;
    default:
      exec(`xdg-open "${filePath}"`);
      break;
  }
}

openFile(reportPath);

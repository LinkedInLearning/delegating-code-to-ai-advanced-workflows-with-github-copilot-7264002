import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "logs");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

console.log("✅ ResourceStack ready");
console.log("- Run: npm run gp:dev");

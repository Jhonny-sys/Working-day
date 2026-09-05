
import { existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const example = join(root, ".env.example");
const dest = join(root, ".env");

if (!existsSync(example)) {
  console.warn(`[setup-env] No se encontro ${example}, se omite.`);
} else if (existsSync(dest)) {
  console.log(`[setup-env] Ya existe ${dest}, no se sobrescribe.`);
} else {
  copyFileSync(example, dest);
  console.log(`[setup-env] Creado ${dest} a partir de .env.example`);
}
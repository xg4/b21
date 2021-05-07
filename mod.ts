const { args } = Deno;
import { readJson, writeCsv } from "./util.ts";
import { convertCsv } from "./converter.ts";

const path = args[0];

const { folders, items } = await readJson(path);

const newPath = await writeCsv(path, convertCsv(folders, items));

console.log(`🚀 ${newPath} is created!`);

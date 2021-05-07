export async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await Deno.readTextFile(path));
}

export async function writeCsv(path: string, content: string): Promise<string> {
  const _path = path.split(".");
  _path.pop();
  _path.push("csv");
  const newPath = _path.join(".");
  await Deno.writeTextFile(newPath, content);
  return newPath;
}

import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const port = Number(process.env.MOCK_API_PORT ?? 3001);
const databasePath = fileURLToPath(new URL("./db.json", import.meta.url));
const collectionNames = new Set([
  "users", "customers", "categories", "products", "sellingPriceHistory",
  "bills", "soldItems", "paymentHistory", "cashMovements", "cashDrawers",
]);

async function readDatabase() {
  return JSON.parse(await readFile(databasePath, "utf8"));
}

async function writeDatabase(database) {
  await writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
}

function send(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  response.end(value === undefined ? "" : JSON.stringify(value));
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw Object.assign(new Error("Request body is too large"), { status: 413 });
  }
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw Object.assign(new Error("Request body must be valid JSON"), { status: 400 });
  }
}

function matchesQuery(record, params) {
  return [...params.entries()].every(([key, value]) => {
    if (key === "_sort" || key === "_order" || key === "_page" || key === "_limit") return true;
    return String(record[key] ?? "") === value;
  });
}

function filterAndSort(records, params) {
  let result = records.filter((record) => matchesQuery(record, params));
  const sortKey = params.get("_sort");
  if (sortKey) {
    const direction = params.get("_order") === "desc" ? -1 : 1;
    result = [...result].sort((left, right) => String(left[sortKey] ?? "").localeCompare(String(right[sortKey] ?? ""), undefined, { numeric: true }) * direction);
  }
  const limit = Number(params.get("_limit"));
  const page = Number(params.get("_page")) || 1;
  if (limit > 0) result = result.slice((page - 1) * limit, page * limit);
  return result;
}

async function handleLogin(request, response) {
  if (request.method !== "POST") return send(response, 405, { message: "Method not allowed" });
  const { username, password } = await readBody(request);
  const database = await readDatabase();
  const user = database.users.find((entry) => entry.username === username && entry.password === password);
  if (!user) return send(response, 401, { message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  const { password: _password, ...safeUser } = user;
  return send(response, 200, { token: `demo-${randomUUID()}`, user: safeUser });
}

async function handleCollection(request, response, collection, id, params) {
  const database = await readDatabase();
  if (!Array.isArray(database[collection])) return send(response, 404, { message: "Resource not found" });
  const records = database[collection];

  if (request.method === "GET") {
    if (id !== undefined) {
      const record = records.find((entry) => String(entry.id) === id);
      return record ? send(response, 200, record) : send(response, 404, { message: "Record not found" });
    }
    const result = filterAndSort(records, params);
    return send(response, 200, collection === "users"
      ? result.map(({ password: _password, ...user }) => user)
      : result);
  }

  if (request.method === "POST") {
    const body = await readBody(request);
    if (typeof body !== "object" || body === null || Array.isArray(body)) return send(response, 400, { message: "Expected a JSON object" });
    const record = { ...body, id: String(body.id ?? randomUUID()) };
    records.push(record);
    await writeDatabase(database);
    return send(response, 201, record);
  }

  if (["PUT", "PATCH", "DELETE"].includes(request.method) && id !== undefined) {
    const index = records.findIndex((entry) => String(entry.id) === id);
    if (index < 0) return send(response, 404, { message: "Record not found" });
    if (request.method === "DELETE") {
      const [removed] = records.splice(index, 1);
      await writeDatabase(database);
      return send(response, 200, removed);
    }
    const body = await readBody(request);
    records[index] = request.method === "PUT"
      ? { ...body, id: records[index].id }
      : { ...records[index], ...body, id: records[index].id };
    await writeDatabase(database);
    return send(response, 200, records[index]);
  }

  return send(response, 405, { message: "Method not allowed" });
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") return send(response, 204);
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== "api") return send(response, 404, { message: "Use the /api prefix" });
  if (parts[1] === "health") return send(response, 200, { status: "ok", mode: "mock-json" });

  try {
    if (parts[1] === "auth" && parts[2] === "login") return await handleLogin(request, response);
    const collection = parts[1];
    if (!collectionNames.has(collection)) return send(response, 404, { message: "Resource not found" });
    return await handleCollection(request, response, collection, parts[2], url.searchParams);
  } catch (error) {
    const status = Number(error?.status) || 500;
    return send(response, status, { message: status === 500 ? "Mock API error" : error.message });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Sendal mock JSON API: http://localhost:${port}/api`);
});

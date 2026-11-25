import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { createItem, deleteItem, getItem, listItems, resetItems } from "../src/items.js";
import { createApp, startServer } from "../src/server.js";

let server;
let baseUrl;

beforeEach(async () => {
  resetItems();
  server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

afterEach(async () => {
  if (!server) {
    return;
  }
  await new Promise((resolve) => server.close(resolve));
  server = undefined;
});

test("crea, lista, obtiene y elimina un item", () => {
  const created = createItem("  Cable  ");
  assert.deepEqual(created, { id: 1, name: "Cable" });
  assert.deepEqual(listItems(), [{ id: 1, name: "Cable" }]);
  assert.deepEqual(getItem(1), { id: 1, name: "Cable" });
  assert.equal(deleteItem(1), true);
  assert.equal(getItem(1), null);
  assert.equal(deleteItem(1), false);
  assert.deepEqual(listItems(), []);
  assert.equal(getItem("no-num"), null);
});

test("rechaza un nombre vacio", () => {
  assert.throws(() => createItem("   "), { message: "El nombre es obligatorio", status: 400 });
  assert.throws(() => createItem(null), { message: "El nombre es obligatorio" });
});

test("asigna ids consecutivos", () => {
  assert.equal(createItem("Uno").id, 1);
  assert.equal(createItem("Dos").id, 2);
});

test("health responde ok", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("expone el alta, la consulta y el borrado por HTTP", async () => {
  const created = await fetch(`${baseUrl}/api/items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Switch" }),
  });
  assert.equal(created.status, 201);
  assert.deepEqual(await created.json(), { id: 1, name: "Switch" });

  const list = await fetch(`${baseUrl}/api/items`);
  assert.equal(list.status, 200);
  assert.deepEqual(await list.json(), [{ id: 1, name: "Switch" }]);

  const found = await fetch(`${baseUrl}/api/items/1`);
  assert.equal(found.status, 200);
  assert.deepEqual(await found.json(), { id: 1, name: "Switch" });

  const removed = await fetch(`${baseUrl}/api/items/1`, { method: "DELETE" });
  assert.equal(removed.status, 204);

  const missing = await fetch(`${baseUrl}/api/items/1`);
  assert.equal(missing.status, 404);
});

test("responde 400 si el nombre no viene y 404 si el id no existe", async () => {
  const invalid = await fetch(`${baseUrl}/api/items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(invalid.status, 400);
  assert.deepEqual(await invalid.json(), { error: "El nombre es obligatorio" });

  const missing = await fetch(`${baseUrl}/api/items/9`, { method: "DELETE" });
  assert.equal(missing.status, 404);
});

test("startServer escucha el puerto indicado", async () => {
  await new Promise((resolve) => server.close(resolve));
  server = undefined;

  const started = startServer(0);
  await new Promise((resolve) => started.once("listening", resolve));
  const { port } = started.address();
  const response = await fetch(`http://127.0.0.1:${port}/health`);
  assert.equal(response.status, 200);
  await new Promise((resolve) => started.close(resolve));
});

import express from "express";
import { createItem, deleteItem, getItem, listItems, resetItems } from "./items.js";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/api/items", (_request, response) => {
    response.json(listItems());
  });

  app.get("/api/items/:id", (request, response) => {
    const item = getItem(Number(request.params.id));
    if (!item) {
      response.status(404).json({ error: "Item no encontrado" });
      return;
    }
    response.json(item);
  });

  app.post("/api/items", (request, response) => {
    try {
      const item = createItem(request.body?.name);
      response.status(201).json(item);
    } catch (error) {
      response.status(error.status || 500).json({ error: error.message });
    }
  });

  app.delete("/api/items/:id", (request, response) => {
    const removed = deleteItem(Number(request.params.id));
    if (!removed) {
      response.status(404).json({ error: "Item no encontrado" });
      return;
    }
    response.status(204).send();
  });

  return app;
}

export function startServer(port = process.env.PORT || 3000) {
  const app = createApp();
  return app.listen(port);
}

const executedDirectly = process.argv[1] &&
  process.argv[1].endsWith("server.js");

if (executedDirectly) {
  startServer();
}

export { resetItems };

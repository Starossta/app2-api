const items = [];
let nextId = 1;

export function resetItems() {
  items.length = 0;
  nextId = 1;
}

export function listItems() {
  return items.map((item) => ({ ...item }));
}

export function getItem(id) {
  const item = items.find((entry) => entry.id === id);
  return item ? { ...item } : null;
}

export function createItem(name) {
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) {
    const error = new Error("El nombre es obligatorio");
    error.status = 400;
    throw error;
  }

  const item = { id: nextId, name: trimmed };
  nextId += 1;
  items.push(item);
  return { ...item };
}

export function deleteItem(id) {
  const index = items.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return false;
  }

  items.splice(index, 1);
  return true;
}

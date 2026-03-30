const messageEl = document.getElementById("message");
const trianglesBody = document.getElementById("triangles-body");
const typeFilter = document.getElementById("type-filter");

const sumTotal = document.getElementById("sum-total");
const sumValid = document.getElementById("sum-valid");
const sumInvalid = document.getElementById("sum-invalid");
const byType = document.getElementById("by-type");

function showMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`.trim();
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function readTriangleFields(form) {
  const a = toNumber(form.a.value);
  const b = toNumber(form.b.value);
  const c = toNumber(form.c.value);
  if (a === null || b === null || c === null) {
    return { ok: false, error: "All side values must be numeric." };
  }
  return { ok: true, value: { a, b, c } };
}

async function apiFetch(path, options = {}) {
  const response = await fetch(path, options);
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    const msg = data.error || `Request failed with status ${response.status}`;
    throw new Error(msg);
  }
  return data;
}

function renderRows(items) {
  if (!items.length) {
    trianglesBody.innerHTML = `<tr><td colspan="7">No records found for current filter.</td></tr>`;
    return;
  }

  trianglesBody.innerHTML = items
    .map(
      (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.a}</td>
        <td>${item.b}</td>
        <td>${item.c}</td>
        <td>${item.is_valid}</td>
        <td>${item.triangle_type}</td>
        <td>${item.created_at}</td>
      </tr>
    `
    )
    .join("");
}

async function refreshSummary() {
  const summary = await apiFetch("/triangles/summary");
  sumTotal.textContent = String(summary.total ?? 0);
  sumValid.textContent = String(summary.valid ?? 0);
  sumInvalid.textContent = String(summary.invalid ?? 0);
  byType.textContent = JSON.stringify(summary.by_type ?? {}, null, 2);
}

async function refreshList() {
  const type = typeFilter.value;
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  const data = await apiFetch(`/triangles${query}`);
  renderRows(data.items || []);
}

async function refreshAll() {
  await Promise.all([refreshSummary(), refreshList()]);
}

document.getElementById("refresh-all").addEventListener("click", async () => {
  try {
    await refreshAll();
    showMessage("Data grid refreshed.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

typeFilter.addEventListener("change", async () => {
  try {
    await refreshList();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

document.getElementById("create-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const parsed = readTriangleFields(form);
  if (!parsed.ok) {
    showMessage(parsed.error, "error");
    return;
  }

  try {
    const response = await apiFetch("/triangles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.value),
    });
    form.reset();
    await refreshAll();
    showMessage(`Created triangle #${response.item.id}.`, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

document.getElementById("update-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const id = Number(form.id.value);
  if (!Number.isInteger(id) || id <= 0) {
    showMessage("Update ID must be a positive integer.", "error");
    return;
  }

  const parsed = readTriangleFields(form);
  if (!parsed.ok) {
    showMessage(parsed.error, "error");
    return;
  }

  try {
    await apiFetch(`/triangles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.value),
    });
    await refreshAll();
    showMessage(`Updated triangle #${id}.`, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

document.getElementById("delete-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const id = Number(form.id.value);
  if (!Number.isInteger(id) || id <= 0) {
    showMessage("Delete ID must be a positive integer.", "error");
    return;
  }

  try {
    await apiFetch(`/triangles/${id}`, { method: "DELETE" });
    form.reset();
    await refreshAll();
    showMessage(`Deleted triangle #${id}.`, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await refreshAll();
    showMessage("Nexus interface online.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

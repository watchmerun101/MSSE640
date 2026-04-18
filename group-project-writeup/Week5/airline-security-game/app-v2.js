const POLICY = {
  maxWeightKg: 7.0,
  maxContainerMl: 100,
  maxContainerCount: 3,
};

const PAIRWISE_PARAMS = {
  weight: ["normal", "heavy"],
  liquid: ["ok", "over"],
  containers: ["ok", "over"],
  prohibited: ["none", "present"],
  passValid: ["valid", "invalid"],
};

const PAIRWISE_VALUE_MAP = {
  weight: { normal: 6.2, heavy: 7.4 },
  liquid: { ok: 70, over: 120 },
  containers: { ok: 2, over: 4 },
  prohibited: { none: false, present: true },
  passValid: { valid: true, invalid: false },
};

const DEFAULT_DECISION_TABLE = [
  {
    id: "R1",
    title: "Sunny Day — All conditions pass",
    conditions: { weightOk: "T", liquidOk: "T", containersOk: "T", noProhibited: "T", validPass: "T" },
    action: "",
  },
  {
    id: "R2",
    title: "Rainy Day — Overweight",
    conditions: { weightOk: "T", liquidOk: "T", containersOk: "T", noProhibited: "T", validPass: "T" },
    action: "",
  },
  {
    id: "R3",
    title: "Rainy Day — Too much liquid",
    conditions: { weightOk: "T", liquidOk: "T", containersOk: "T", noProhibited: "T", validPass: "T" },
    action: "",
  },
  {
    id: "R4",
    title: "Rainy Day — Too many containers",
    conditions: { weightOk: "T", liquidOk: "T", containersOk: "T", noProhibited: "T", validPass: "T" },
    action: "",
  },
  {
    id: "R5",
    title: "Rainy Day — Prohibited item",
    conditions: { weightOk: "T", liquidOk: "T", containersOk: "T", noProhibited: "T", validPass: "T" },
    action: "",
  },
  {
    id: "R6",
    title: "Rainy Day — Invalid boarding pass",
    conditions: { weightOk: "T", liquidOk: "T", containersOk: "T", noProhibited: "T", validPass: "T" },
    action: "",
  },
  {
    id: "R7",
    title: "Rainy Day — Multiple failures",
    conditions: { weightOk: "T", liquidOk: "T", containersOk: "T", noProhibited: "T", validPass: "T" },
    action: "",
  },
];

const dom = {
  resetAppBtn: document.getElementById("reset-app-btn"),
  refreshTableBtn: document.getElementById("refresh-table-btn"),
  submitDecisionTableBtn: document.getElementById("submit-decision-table-btn"),
  educatorToggle: document.getElementById("educator-toggle"),
  deterministicToggle: document.getElementById("deterministic-toggle"),
  seedInput: document.getElementById("seed-input"),
  banner: document.getElementById("banner"),
  roundNum: document.getElementById("round-num"),
  bugProgress: document.getElementById("bug-progress"),
  score: document.getElementById("score"),
  queueLeft: document.getElementById("queue-left"),
  decisionTableContainer: document.getElementById("decision-table-container"),
  educatorPanel: document.getElementById("educator-panel"),
  guidedWeight: document.getElementById("guided-weight"),
  guidedLiquid: document.getElementById("guided-liquid"),
  guidedContainers: document.getElementById("guided-containers"),
  guidedProhibited: document.getElementById("guided-prohibited"),
  guidedPassValid: document.getElementById("guided-pass-valid"),
  evaluateGuidedBtn: document.getElementById("evaluate-guided-btn"),
  pairwiseWeight: document.getElementById("pairwise-weight"),
  pairwiseLiquid: document.getElementById("pairwise-liquid"),
  pairwiseContainers: document.getElementById("pairwise-containers"),
  pairwiseProhibited: document.getElementById("pairwise-prohibited"),
  pairwisePassValid: document.getElementById("pairwise-pass-valid"),
  evaluatePairwiseGuidedBtn: document.getElementById("evaluate-pairwise-guided-btn"),  pairwiseWeight: document.getElementById("pairwise-weight"),
  pairwiseLiquid: document.getElementById("pairwise-liquid"),
  pairwiseContainers: document.getElementById("pairwise-containers"),
  pairwiseProhibited: document.getElementById("pairwise-prohibited"),
  pairwisePassValid: document.getElementById("pairwise-pass-valid"),  pairwiseWeight: document.getElementById("pairwise-weight"),
  pairwiseLiquid: document.getElementById("pairwise-liquid"),
  pairwiseContainers: document.getElementById("pairwise-containers"),
  pairwiseProhibited: document.getElementById("pairwise-prohibited"),
  pairwisePassValid: document.getElementById("pairwise-pass-valid"),
  pairwiseWeight: document.getElementById("pairwise-weight"),
  pairwiseLiquid: document.getElementById("pairwise-liquid"),
  pairwiseContainers: document.getElementById("pairwise-containers"),
  pairwiseProhibited: document.getElementById("pairwise-prohibited"),
  pairwisePassValid: document.getElementById("pairwise-pass-valid"),
  pairwiseGuidedForm: document.getElementById("pairwise-guided-form"),
  pairwiseResults: document.getElementById("pairwise-results"),
  matchedRule: document.getElementById("matched-rule"),

  tableVerdictLabel: document.getElementById("table-verdict"),
  policyVerdictLabel: document.getElementById("policy-verdict"),
  pairwiseMatchedRule: document.getElementById("pairwise-matched-rule"),
  pairwiseTableVerdict: document.getElementById("pairwise-table-verdict"),
  pairwisePolicyVerdict: document.getElementById("pairwise-policy-verdict"),
  generatePairwiseBtn: document.getElementById("generate-pairwise-btn"),
  loadSunnyBtn: document.getElementById("load-sunny-btn"),
  loadRainyBtn: document.getElementById("load-rainy-btn"),
  pairwiseList: document.getElementById("pairwise-list"),
  currentPassengerGrid: document.getElementById("current-passenger-grid"),
  scannerVerdict: document.getElementById("scanner-verdict"),
};

const state = {
  rng: null,
  seedLabel: "MSSE640-DEMO",
  decisionTable: JSON.parse(JSON.stringify(DEFAULT_DECISION_TABLE)),
  pairwiseCases: [],
  selectedPairwiseIndex: null,
  evaluationCount: 0,
  lastVerdict: "N/A",
};

const NAMES = [
  "A. Reed", "B. Moreno", "C. Park", "D. Lewis", "E. Novak", "F. Khan", "G. Silva", "H. Stone", "I. Tran", "J. Patel",
  "K. Cole", "L. Kim", "M. Diaz", "N. Ahmed", "O. Green", "P. Rossi", "Q. Allen", "R. Wang", "S. Bell", "T. Roy",
];

function seedToUint32(seedText) {
  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i += 1) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createMulberry32(seedInt) {
  let t = seedInt >>> 0;
  return function seededRandom() {
    t += 0x6d2b79f5;
    let z = t;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

function rand() {
  if (typeof state.rng === "function") {
    return state.rng();
  }
  return Math.random();
}

function randChoice(list) {
  return list[Math.floor(rand() * list.length)];
}

function configureRandomness() {
  if (!dom.deterministicToggle.checked) {
    state.rng = null;
    state.seedLabel = "RANDOM";
    return;
  }
  const seedText = (dom.seedInput.value || "MSSE640-DEMO").trim() || "MSSE640-DEMO";
  state.rng = createMulberry32(seedToUint32(seedText));
  state.seedLabel = seedText;
}

function makePassenger(data) {
  return {
    name: randChoice(NAMES),
    flight: `RU${Math.floor(100 + rand() * 900)}`,
    gate: `G${Math.floor(1 + rand() * 32)}`,
    ...data,
  };
}

function policyDecision(passenger) {
  const weight = Number(passenger.weightKg);
  const liquid = Number(passenger.liquidsMl);
  const containers = Number(passenger.containerCount);
  if (!Number.isFinite(weight) || !Number.isFinite(liquid) || !Number.isFinite(containers)) {
    return "HOLD";
  }
  if (weight < 0 || liquid < 0 || containers < 0) {
    return "HOLD";
  }
  if (passenger.prohibited || !passenger.passValid || weight > POLICY.maxWeightKg || liquid > POLICY.maxContainerMl || containers > POLICY.maxContainerCount) {
    return "HOLD";
  }
  return "CLEAR";
}

function conditionsMatch(ruleValue, actualValue) {
  if (ruleValue === "-") {
    return true;
  }
  if (ruleValue === "T") {
    return actualValue === true;
  }
  if (ruleValue === "F") {
    return actualValue === false;
  }
  return false;
}

function evaluateDecisionTable(passenger) {
  const actual = {
    weightOk: Number(passenger.weightKg) <= POLICY.maxWeightKg && Number(passenger.weightKg) >= 0,
    liquidOk: Number(passenger.liquidsMl) <= POLICY.maxContainerMl && Number(passenger.liquidsMl) >= 0,
    containersOk: Number(passenger.containerCount) <= POLICY.maxContainerCount && Number(passenger.containerCount) >= 0,
    noProhibited: !passenger.prohibited,
    validPass: passenger.passValid === true,
  };

  for (const rule of state.decisionTable) {
    const conditions = rule.conditions;
    if (
      conditionsMatch(conditions.weightOk, actual.weightOk) &&
      conditionsMatch(conditions.liquidOk, actual.liquidOk) &&
      conditionsMatch(conditions.containersOk, actual.containersOk) &&
      conditionsMatch(conditions.noProhibited, actual.noProhibited) &&
      conditionsMatch(conditions.validPass, actual.validPass)
    ) {
      return { verdict: rule.action, ruleId: rule.id, ruleTitle: rule.title };
    }
  }

  return { verdict: "HOLD", ruleId: "Default", ruleTitle: "No matching rule; default HOLD" };
}

function renderDecisionTable() {
  const headers = ["Condition", ...state.decisionTable.map((rule) => `${rule.id}`)];
  const rows = [
    { label: "Rule Title", field: "title", type: "title" },
    { label: "Weight <= 7.0 kg", field: "weightOk" },
    { label: "Liquid <= 100 ml", field: "liquidOk" },
    { label: "Container count <= 3", field: "containersOk" },
    { label: "No prohibited item", field: "noProhibited" },
    { label: "Boarding pass valid", field: "validPass" },
    { label: "Action", field: "action", type: "action" },
  ];

  const table = document.createElement("table");
  table.className = "decision-table";
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const labelCell = document.createElement("th");
    labelCell.textContent = row.label;
    tr.appendChild(labelCell);

    state.decisionTable.forEach((rule, ruleIndex) => {
      const td = document.createElement("td");
      if (row.type === "title") {
        const input = document.createElement("input");
        input.value = rule.title;
        input.className = "select-cell";
        input.readOnly = true;
        input.style.background = "#f0f0f0";
        input.style.cursor = "default";
        td.appendChild(input);
      } else if (row.type === "action") {
        const actionSelect = document.createElement("select");
        actionSelect.className = "select-cell";
        ["", "CLEAR", "HOLD"].forEach((value) => {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = value || "(blank)";
          option.selected = rule.action === value;
          actionSelect.appendChild(option);
        });
        actionSelect.addEventListener("change", (event) => {
          state.decisionTable[ruleIndex].action = event.target.value;
          renderDecisionTable();
        });
        td.appendChild(actionSelect);
      } else {
        const select = document.createElement("select");
        select.className = "select-cell";
        ["", "T", "F", "-"].forEach((value) => {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = value || "(blank)";
          option.selected = rule.conditions[row.field] === value;
          select.appendChild(option);
        });
        select.addEventListener("change", (event) => {
          state.decisionTable[ruleIndex].conditions[row.field] = event.target.value;
          renderDecisionTable();
        });
        td.appendChild(select);
      }
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  dom.decisionTableContainer.innerHTML = "";
  dom.decisionTableContainer.appendChild(table);
  dom.bugProgress.textContent = String(state.decisionTable.length);
}

function resetDecisionTable() {
  state.decisionTable = JSON.parse(JSON.stringify(DEFAULT_DECISION_TABLE));
  renderDecisionTable();
  setBanner("Decision table restored to default rules.");
}

function submitDecisionTable() {
  // Check if table is filled
  let filled = true;
  for (const rule of state.decisionTable) {
    if (!rule.title.trim() || !rule.action) {
      filled = false;
      break;
    }
    for (const cond in rule.conditions) {
      if (!rule.conditions[cond]) {
        filled = false;
        break;
      }
    }
    if (!filled) break;
  }
  if (!filled) {
    setBanner("Please fill in all rule titles, conditions, and actions before submitting.");
    return;
  }
  // Run a test evaluation
  const testPassenger = makePassenger({ weightKg: 6.2, liquidsMl: 70, containerCount: 2, prohibited: false, passValid: true });
  const tableResult = evaluateDecisionTable(testPassenger);
  const policyResult = policyDecision(testPassenger);
  state.evaluationCount += 1;
  state.lastVerdict = tableResult.verdict;
  if (tableResult.verdict === policyResult) {
    setBanner(`Decision table submitted successfully! Test case matches policy: ${tableResult.verdict}.`);
  } else {
    setBanner(`Decision table submitted, but test case mismatch: Table says ${tableResult.verdict}, policy says ${policyResult}. Please review your rules.`);
  }
  refreshStats();
}

function getGuidedScenario() {
  return makePassenger({
    weightKg: Number(dom.guidedWeight.value),
    liquidsMl: Number(dom.guidedLiquid.value),
    containerCount: Number(dom.guidedContainers.value),
    prohibited: dom.guidedProhibited.checked,
    passValid: dom.guidedPassValid.checked,
  });
}

function renderPassenger(scenario) {
  const p = scenario.passenger;
  dom.currentPassengerGrid.innerHTML = [
    metric("Passenger", p.name),
    metric("Flight", p.flight),
    metric("Gate", p.gate),
    metric("Bag Weight (kg)", String(p.weightKg)),
    metric("Largest Liquid (ml)", String(p.liquidsMl)),
    metric("Container Count", String(p.containerCount)),
    metric("Contains Prohibited Item", String(p.prohibited)),
    metric("Boarding Pass Valid", String(p.passValid)),
  ].join("");

  dom.scannerVerdict.textContent = scenario.tableVerdict;
  dom.scannerVerdict.style.color = scenario.tableVerdict === "CLEAR" ? "#2a9961" : "#d83e3e";
}

function metric(key, value) {
  return `<article class="metric"><p class="k">${key}</p><p class="v">${value}</p></article>`;
}

function setBanner(text) {
  dom.banner.textContent = text;
}

function refreshStats() {
  dom.roundNum.textContent = String(state.evaluationCount);
  dom.score.textContent = state.lastVerdict;
  dom.queueLeft.textContent = String(state.pairwiseCases.length);
}

function evaluateGuidedScenario() {
  const scenario = getGuidedScenario();
  const policyVerdict = policyDecision(scenario);
  const tableResult = evaluateDecisionTable(scenario);
  state.evaluationCount += 1;
  state.lastVerdict = tableResult.verdict;
  dom.matchedRule.textContent = `${tableResult.ruleId} — ${tableResult.ruleTitle}`;
  dom.tableVerdictLabel.textContent = tableResult.verdict;
  dom.policyVerdictLabel.textContent = policyVerdict;
  renderPassenger({ passenger: scenario, tableVerdict: tableResult.verdict });
  setBanner(`Evaluated guided scenario. Table says ${tableResult.verdict}, policy says ${policyVerdict}.`);
  refreshStats();
}

function generateAllCombos(parameters) {
  const keys = Object.keys(parameters);
  const combos = [];

  function build(index, current) {
    if (index === keys.length) {
      combos.push({ ...current });
      return;
    }
    const key = keys[index];
    parameters[key].forEach((value) => {
      current[key] = value;
      build(index + 1, current);
    });
  }
  build(0, {});
  return combos;
}

function buildPairKey(param, value) {
  return `${param}:${value}`;
}

function generatePairwiseCases() {
  const allCombos = generateAllCombos(PAIRWISE_PARAMS);
  const allPairs = new Set();
  const keys = Object.keys(PAIRWISE_PARAMS);

  allCombos.forEach((combo) => {
    for (let i = 0; i < keys.length; i += 1) {
      for (let j = i + 1; j < keys.length; j += 1) {
        const pair = `${keys[i]}=${combo[keys[i]]}|${keys[j]}=${combo[keys[j]]}`;
        allPairs.add(pair);
      }
    }
  });

  const uncovered = new Set(allPairs);
  const chosen = [];
  let remaining = [...allCombos];

  while (uncovered.size > 0 && remaining.length) {
    let best = null;
    let bestScore = -1;
    let bestNewPairs = null;

    remaining.forEach((combo) => {
      const pairSet = new Set();
      for (let i = 0; i < keys.length; i += 1) {
        for (let j = i + 1; j < keys.length; j += 1) {
          const pair = `${keys[i]}=${combo[keys[i]]}|${keys[j]}=${combo[keys[j]]}`;
          if (uncovered.has(pair)) {
            pairSet.add(pair);
          }
        }
      }
      if (pairSet.size > bestScore) {
        bestScore = pairSet.size;
        best = combo;
        bestNewPairs = pairSet;
      }
    });

    if (!best || bestScore === 0) {
      break;
    }

    chosen.push(best);
    bestNewPairs.forEach((pair) => uncovered.delete(pair));
    remaining = remaining.filter((combo) => combo !== best);
  }

  return chosen.map((entry) => ({
    entry,
    name: `weight=${entry.weight}, liquid=${entry.liquid}, containers=${entry.containers}, prohibited=${entry.prohibited}, pass=${entry.passValid}`,
  }));
}

function renderPairwiseCases() {
  dom.pairwiseList.innerHTML = "";
  state.pairwiseCases.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = `pairwise-item${state.selectedPairwiseIndex === index ? " selected" : ""}`;
    li.innerHTML = `<strong>Case ${index + 1}</strong><div>${item.name}</div>`;
    li.addEventListener("click", () => {
      loadPairwiseCase(index);
    });
    dom.pairwiseList.appendChild(li);
  });
  dom.queueLeft.textContent = String(state.pairwiseCases.length);
}

function getPairwiseGuidedEntry() {
  return {
    weightKg: Number(dom.pairwiseWeight.value),
    liquidsMl: Number(dom.pairwiseLiquid.value),
    containerCount: Number(dom.pairwiseContainers.value),
    prohibited: dom.pairwiseProhibited.checked,
    passValid: dom.pairwisePassValid.checked,
  };
}

function submitPairwiseCase() {
  // Check if all selects have values
  const selects = [dom.pairwiseWeight, dom.pairwiseLiquid, dom.pairwiseContainers, dom.pairwiseProhibited, dom.pairwisePassValid];
  for (const select of selects) {
    if (!select.value) {
      setBanner("Please select values for all pairwise test case inputs before submitting.");
      return;
    }
  }
  const entry = getPairwiseGuidedEntry();
  const passenger = makePassenger(entry);
  const tableResult = evaluateDecisionTable(passenger);
  const policyResult = policyDecision(passenger);
  state.evaluationCount += 1;
  state.lastVerdict = tableResult.verdict;
  dom.pairwiseMatchedRule.textContent = `${tableResult.ruleId} — ${tableResult.ruleTitle}`;
  dom.pairwiseTableVerdict.textContent = tableResult.verdict;
  dom.pairwisePolicyVerdict.textContent = policyResult;
  renderPassenger({ passenger, tableVerdict: tableResult.verdict });
  if (tableResult.verdict === policyResult) {
    setBanner(`Pairwise case submitted successfully! Table verdict matches policy: ${tableResult.verdict}.`);
  } else {
    setBanner(`Pairwise case submitted, but verdict mismatch: Table says ${tableResult.verdict}, policy says ${policyResult}. Please review your decision table.`);
  }
  refreshStats();
}

function mapPairwiseToPassenger(pairwiseEntry) {
  return {
    weightKg: PAIRWISE_VALUE_MAP.weight[pairwiseEntry.weight],
    liquidsMl: PAIRWISE_VALUE_MAP.liquid[pairwiseEntry.liquid],
    containerCount: PAIRWISE_VALUE_MAP.containers[pairwiseEntry.containers],
    prohibited: PAIRWISE_VALUE_MAP.prohibited[pairwiseEntry.prohibited],
    passValid: PAIRWISE_VALUE_MAP.passValid[pairwiseEntry.passValid],
  };
}

function loadPairwiseCase(index) {
  const caseEntry = state.pairwiseCases[index];
  if (!caseEntry) {
    return;
  }
  state.selectedPairwiseIndex = index;
  const passenger = makePassenger(mapPairwiseToPassenger(caseEntry.entry));
  const tableResult = evaluateDecisionTable(passenger);
  const policyResult = policyDecision(passenger);

  state.evaluationCount += 1;
  state.lastVerdict = tableResult.verdict;
  dom.matchedRule.textContent = `${tableResult.ruleId} — ${tableResult.ruleTitle}`;
  dom.tableVerdictLabel.textContent = tableResult.verdict;
  dom.policyVerdictLabel.textContent = policyResult;
  renderPassenger({ passenger, tableVerdict: tableResult.verdict });
  setBanner(`Loaded pairwise case ${index + 1}. Table: ${tableResult.verdict}, policy: ${policyResult}.`);
  refreshStats();
  renderPairwiseCases();
}

function loadSunnyDay() {
  const passenger = makePassenger({ weightKg: 6.2, liquidsMl: 70, containerCount: 2, prohibited: false, passValid: true });
  const tableResult = evaluateDecisionTable(passenger);
  const policyResult = policyDecision(passenger);
  state.evaluationCount += 1;
  state.lastVerdict = tableResult.verdict;
  dom.matchedRule.textContent = `${tableResult.ruleId} — ${tableResult.ruleTitle}`;
  dom.tableVerdictLabel.textContent = tableResult.verdict;
  dom.policyVerdictLabel.textContent = policyResult;
  renderPassenger({ passenger, tableVerdict: tableResult.verdict });
  setBanner(`Sunny Day scenario loaded. Table: ${tableResult.verdict}, policy: ${policyResult}.`);
  refreshStats();
}

function loadRainyDay() {
  const passenger = makePassenger({ weightKg: 7.8, liquidsMl: 120, containerCount: 4, prohibited: true, passValid: false });
  const tableResult = evaluateDecisionTable(passenger);
  const policyResult = policyDecision(passenger);
  state.evaluationCount += 1;
  state.lastVerdict = tableResult.verdict;
  dom.matchedRule.textContent = `${tableResult.ruleId} — ${tableResult.ruleTitle}`;
  dom.tableVerdictLabel.textContent = tableResult.verdict;
  dom.policyVerdictLabel.textContent = policyResult;
  renderPassenger({ passenger, tableVerdict: tableResult.verdict });
  setBanner(`Rainy Day scenario loaded. Table: ${tableResult.verdict}, policy: ${policyResult}.`);
  refreshStats();
}

function toggleEducatorMode() {
  const isEducator = dom.educatorToggle.checked;
  dom.educatorPanel.classList.toggle("hidden", !isEducator);
  dom.pairwiseGuidedForm.classList.toggle("hidden", !isEducator);
  dom.pairwiseResults.classList.toggle("hidden", !isEducator);
  const pairwiseNote = document.getElementById("pairwise-note");
  if (pairwiseNote) pairwiseNote.classList.toggle("hidden", !isEducator);
  setBanner(isEducator ? "Educator Mode is on. Use guided input to build scenarios." : "Fully editable decision table mode is active.");
}

function resetApp() {
  configureRandomness();
  resetDecisionTable();
  state.pairwiseCases = [];
  state.selectedPairwiseIndex = null;
  state.evaluationCount = 0;
  state.lastVerdict = "N/A";
  dom.currentPassengerGrid.innerHTML = '<p class="placeholder">Evaluate a scenario to display a passenger.</p>';
  dom.matchedRule.textContent = "None";
  dom.tableVerdictLabel.textContent = "N/A";
  dom.policyVerdictLabel.textContent = "N/A";
  dom.pairwiseMatchedRule.textContent = "None";
  dom.pairwiseTableVerdict.textContent = "N/A";
  dom.pairwisePolicyVerdict.textContent = "N/A";
  dom.guidedWeight.value = "6.2";
  dom.guidedLiquid.value = "80";
  dom.guidedContainers.value = "2";
  dom.guidedProhibited.checked = false;
  dom.guidedPassValid.checked = true;
  dom.pairwiseWeight.value = "normal";
  dom.pairwiseLiquid.value = "ok";
  dom.pairwiseContainers.value = "ok";
  dom.pairwiseProhibited.checked = "none";
  dom.pairwisePassValid.checked = "valid";
  dom.pairwiseList.innerHTML = "";
  refreshStats();
  setBanner("App reset. Edit the decision table or turn on Educator Mode to begin.");
}

function bindEvents() {
  dom.resetAppBtn.addEventListener("click", resetApp);
  dom.refreshTableBtn.addEventListener("click", resetDecisionTable);
  dom.submitDecisionTableBtn.addEventListener("click", submitDecisionTable);
  dom.educatorToggle.addEventListener("change", toggleEducatorMode);
  dom.deterministicToggle.addEventListener("change", () => {
    const enabled = dom.deterministicToggle.checked;
    dom.seedInput.disabled = !enabled;
    if (!enabled) {
      dom.seedInput.value = "MSSE640-DEMO";
    }
    configureRandomness();
  });
  dom.evaluateGuidedBtn.addEventListener("click", evaluateGuidedScenario);
  dom.generatePairwiseBtn.addEventListener("click", () => {
    state.pairwiseCases = generatePairwiseCases();
    state.selectedPairwiseIndex = null;
    renderPairwiseCases();
    setBanner("Pairwise cases generated. Click a case to load it into the scenario view.");
  });
  dom.evaluatePairwiseGuidedBtn.addEventListener("click", submitPairwiseCase);
  dom.loadSunnyBtn.addEventListener("click", loadSunnyDay);
  dom.loadRainyBtn.addEventListener("click", loadRainyDay);
}

function initialize() {
  configureRandomness();
  dom.seedInput.disabled = true;
  renderDecisionTable();
  toggleEducatorMode();
  refreshStats();
  bindEvents();
  setBanner("Complete the blank decision table and submit a pairwise test case to verify your work.");
}

initialize();

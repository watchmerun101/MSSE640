const POLICY = {
  maxWeightKg: 7.0,
  maxContainerMl: 100,
  maxContainerCount: 3,
};

const BUG_CATALOG = [
  {
    id: "BUG-01",
    category: "boundary",
    title: "Exact weight boundary rejected",
    makeScenario: () => makePassengerScenario({ weightKg: 7.0, liquidsMl: 80, containerCount: 1, prohibited: false, passValid: true }, "CLEAR", "HOLD"),
  },
  {
    id: "BUG-02",
    category: "boundary",
    title: "Slightly overweight bag accepted",
    makeScenario: () => makePassengerScenario({ weightKg: 7.1, liquidsMl: 60, containerCount: 1, prohibited: false, passValid: true }, "HOLD", "CLEAR"),
  },
  {
    id: "BUG-03",
    category: "boundary",
    title: "Exact liquid boundary rejected",
    makeScenario: () => makePassengerScenario({ weightKg: 6.0, liquidsMl: 100, containerCount: 2, prohibited: false, passValid: true }, "CLEAR", "HOLD"),
  },
  {
    id: "BUG-04",
    category: "boundary",
    title: "Over-limit liquid accepted",
    makeScenario: () => makePassengerScenario({ weightKg: 5.6, liquidsMl: 101, containerCount: 1, prohibited: false, passValid: true }, "HOLD", "CLEAR"),
  },
  {
    id: "BUG-05",
    category: "boundary",
    title: "Container count max rejected",
    makeScenario: () => makePassengerScenario({ weightKg: 4.2, liquidsMl: 95, containerCount: 3, prohibited: false, passValid: true }, "CLEAR", "HOLD"),
  },
  {
    id: "BUG-06",
    category: "boundary",
    title: "Too many containers accepted",
    makeScenario: () => makePassengerScenario({ weightKg: 6.6, liquidsMl: 45, containerCount: 4, prohibited: false, passValid: true }, "HOLD", "CLEAR"),
  },
  {
    id: "BUG-07",
    category: "equivalence",
    title: "Prohibited item class allowed",
    makeScenario: () => makePassengerScenario({ weightKg: 6.4, liquidsMl: 80, containerCount: 1, prohibited: true, passValid: true }, "HOLD", "CLEAR"),
  },
  {
    id: "BUG-08",
    category: "equivalence",
    title: "Invalid boarding pass treated as valid",
    makeScenario: () => makePassengerScenario({ weightKg: 5.9, liquidsMl: 60, containerCount: 1, prohibited: false, passValid: false }, "HOLD", "CLEAR"),
  },
  {
    id: "BUG-09",
    category: "equivalence",
    title: "Negative weight sanitized into valid",
    makeScenario: () => makePassengerScenario({ weightKg: -1.2, liquidsMl: 55, containerCount: 1, prohibited: false, passValid: true }, "HOLD", "CLEAR"),
  },
  {
    id: "BUG-10",
    category: "equivalence",
    title: "Malformed decimal accepted",
    makeScenario: () => makePassengerScenario({ weightKg: "6,5", liquidsMl: 70, containerCount: 1, prohibited: false, passValid: true }, "HOLD", "CLEAR"),
  },
  {
    id: "BUG-11",
    category: "equivalence",
    title: "Multiple violations misclassified as clear",
    makeScenario: () => makePassengerScenario({ weightKg: 7.4, liquidsMl: 112, containerCount: 4, prohibited: false, passValid: true }, "HOLD", "CLEAR"),
  },
  {
    id: "BUG-12",
    category: "equivalence",
    title: "Missing pass barcode accepted",
    makeScenario: () => makePassengerScenario({ weightKg: 6.1, liquidsMl: 72, containerCount: 1, prohibited: false, passValid: "MISSING" }, "HOLD", "CLEAR"),
  },
  {
    id: "BUG-13",
    category: "mixed",
    title: "Boundary plus prohibited conflict resolves wrong",
    makeScenario: () => makePassengerScenario({ weightKg: 7.0, liquidsMl: 100, containerCount: 1, prohibited: true, passValid: true }, "HOLD", "CLEAR"),
  },
  {
    id: "BUG-14",
    category: "mixed",
    title: "Comma liquid format bypasses check",
    makeScenario: () => makePassengerScenario({ weightKg: 5.4, liquidsMl: "100,0", containerCount: 1, prohibited: false, passValid: true }, "HOLD", "CLEAR"),
  },
  {
    id: "BUG-15",
    category: "mixed",
    title: "Near-threshold mixed case incorrectly held",
    makeScenario: () => makePassengerScenario({ weightKg: 6.99, liquidsMl: 99, containerCount: 3, prohibited: false, passValid: true }, "CLEAR", "HOLD"),
  },
];

const dom = {
  newGameBtn: document.getElementById("new-game-btn"),
  deterministicToggle: document.getElementById("deterministic-toggle"),
  seedInput: document.getElementById("seed-input"),
  instructorToggle: document.getElementById("instructor-toggle"),
  banner: document.getElementById("banner"),
  roundNum: document.getElementById("round-num"),
  bugProgress: document.getElementById("bug-progress"),
  score: document.getElementById("score"),
  queueLeft: document.getElementById("queue-left"),
  mixBoundary: document.getElementById("mix-boundary"),
  mixEquivalence: document.getElementById("mix-equivalence"),
  mixWildcard: document.getElementById("mix-wildcard"),
  currentPassengerGrid: document.getElementById("current-passenger-grid"),
  previousPassengerGrid: document.getElementById("previous-passenger-grid"),
  previousPassengerPane: document.getElementById("previous-passenger-pane"),
  scannerVerdict: document.getElementById("scanner-verdict"),
  previousScannerVerdict: document.getElementById("previous-scanner-verdict"),
  approveBtn: document.getElementById("approve-btn"),
  flagBtn: document.getElementById("flag-btn"),
  discoveredList: document.getElementById("discovered-list"),
  activeBugList: document.getElementById("active-bug-list"),
  eventLog: document.getElementById("event-log"),
};

const state = {
  round: 0,
  score: 0,
  activeBugIds: [],
  activeBugMap: new Map(),
  discoveredBugIds: new Set(),
  queue: [],
  currentScenario: null,
  previousScenario: null,
  actionTaken: false,
  roundEnded: false,
  rng: null,
  activeSeedLabel: "",
};

const NAMES = [
  "A. Reed", "B. Moreno", "C. Park", "D. Lewis", "E. Novak", "F. Khan", "G. Silva", "H. Stone", "I. Tran", "J. Patel",
  "K. Cole", "L. Kim", "M. Diaz", "N. Ahmed", "O. Green", "P. Rossi", "Q. Allen", "R. Wang", "S. Bell", "T. Roy"
];

function randChoice(list) {
  return list[Math.floor(rand() * list.length)];
}

function rand() {
  if (typeof state.rng === "function") {
    return state.rng();
  }
  return Math.random();
}

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

function configureRoundRandomness() {
  if (!dom.deterministicToggle.checked) {
    state.rng = null;
    state.activeSeedLabel = "RANDOM";
    return;
  }

  const seedText = (dom.seedInput.value || "MSSE640-DEMO").trim() || "MSSE640-DEMO";
  const seedInt = seedToUint32(seedText);
  state.rng = createMulberry32(seedInt);
  state.activeSeedLabel = seedText;
}

function shuffle(list) {
  const clone = [...list];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function sampleUnique(list, count) {
  return shuffle(list).slice(0, count);
}

function chooseActiveBugsStratified() {
  const boundary = BUG_CATALOG.filter((bug) => bug.category === "boundary");
  const equivalence = BUG_CATALOG.filter((bug) => bug.category === "equivalence");

  const pickBoundary = sampleUnique(boundary, 2);
  const pickEquivalence = sampleUnique(equivalence, 2);
  const chosen = [...pickBoundary, ...pickEquivalence];

  const remaining = BUG_CATALOG.filter((bug) => !chosen.some((selected) => selected.id === bug.id));
  const wildcard = sampleUnique(remaining, 1);

  return shuffle([...chosen, ...wildcard]);
}

function toNumeric(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  return NaN;
}

function isStrictBoolean(value) {
  return value === true || value === false;
}

function policyDecision(passenger) {
  const weight = toNumeric(passenger.weightKg);
  const liquid = toNumeric(passenger.liquidsMl);
  const containers = toNumeric(passenger.containerCount);

  if (!Number.isFinite(weight) || !Number.isFinite(liquid) || !Number.isFinite(containers)) {
    return "HOLD";
  }

  if (weight < 0 || liquid < 0 || containers < 0) {
    return "HOLD";
  }

  if (!isStrictBoolean(passenger.prohibited) || !isStrictBoolean(passenger.passValid)) {
    return "HOLD";
  }

  const overWeight = weight > POLICY.maxWeightKg;
  const overLiquid = liquid > POLICY.maxContainerMl;
  const tooManyContainers = containers > POLICY.maxContainerCount;

  if (passenger.prohibited || !passenger.passValid || overWeight || overLiquid || tooManyContainers) {
    return "HOLD";
  }

  return "CLEAR";
}

function makePassengerScenario(data, expectedVerdict, scannerVerdict, bugId = null) {
  const passenger = {
    name: randChoice(NAMES),
    flight: `RU${Math.floor(100 + rand() * 900)}`,
    gate: `G${Math.floor(1 + rand() * 32)}`,
    ...data,
  };

  return {
    passenger,
    expectedVerdict,
    scannerVerdict,
    bugId,
  };
}

function makeFillerScenario() {
  const passValid = rand() > 0.12;
  const prohibited = rand() < 0.1;
  const weightKg = Number((rand() * 9.2).toFixed(2));
  const liquidsMl = Number((rand() * 140).toFixed(0));
  const containerCount = Math.floor(rand() * 5) + 1;

  const passenger = {
    name: randChoice(NAMES),
    flight: `RU${Math.floor(100 + rand() * 900)}`,
    gate: `G${Math.floor(1 + rand() * 32)}`,
    weightKg,
    liquidsMl,
    containerCount,
    prohibited,
    passValid,
  };

  const expectedVerdict = policyDecision(passenger);

  return {
    passenger,
    expectedVerdict,
    scannerVerdict: expectedVerdict,
    bugId: null,
  };
}

function renderPassenger(scenario, gridEl, verdictEl) {
  const p = scenario.passenger;
  gridEl.innerHTML = [
    metric("Passenger", p.name),
    metric("Flight", p.flight),
    metric("Gate", p.gate),
    metric("Bag Weight (kg)", String(p.weightKg)),
    metric("Largest Liquid (ml)", String(p.liquidsMl)),
    metric("Container Count", String(p.containerCount)),
    metric("Prohibited Item", String(p.prohibited)),
    metric("Boarding Pass Valid", String(p.passValid)),
  ].join("");

  verdictEl.textContent = scenario.scannerVerdict;
  verdictEl.style.color = scenario.scannerVerdict === "CLEAR" ? "#2a9961" : "#d83e3e";
}

function metric(key, value) {
  return `<article class="metric"><p class="k">${key}</p><p class="v">${value}</p></article>`;
}

function logEvent(text) {
  const placeholder = dom.eventLog.querySelector(".placeholder");
  if (placeholder) {
    placeholder.remove();
  }

  const li = document.createElement("li");
  li.textContent = text;
  dom.eventLog.prepend(li);
}

function setBanner(text) {
  dom.banner.textContent = text;
}

function refreshStats() {
  dom.roundNum.textContent = String(state.round);
  dom.bugProgress.textContent = `${state.discoveredBugIds.size}/5`;
  dom.score.textContent = String(state.score);
  dom.queueLeft.textContent = String(state.queue.length + (state.currentScenario ? 1 : 0));

  const activeBugs = state.activeBugIds.map((id) => state.activeBugMap.get(id));
  dom.mixBoundary.textContent = String(activeBugs.filter((b) => b.category === "boundary").length);
  dom.mixEquivalence.textContent = String(activeBugs.filter((b) => b.category === "equivalence").length);
  dom.mixWildcard.textContent = state.activeBugIds.length ? "1" : "0";
}

function refreshDiscoveries() {
  dom.discoveredList.innerHTML = "";

  if (!state.discoveredBugIds.size) {
    dom.discoveredList.innerHTML = '<li class="placeholder">No bugs discovered yet.</li>';
    return;
  }

  [...state.discoveredBugIds]
    .map((id) => state.activeBugMap.get(id))
    .forEach((bug) => {
      const item = document.createElement("li");
      item.innerHTML = `${bug.id} - ${bug.title} <span class="badge ${bug.category}">${bug.category}</span>`;
      dom.discoveredList.appendChild(item);
    });
}

function refreshInstructorReveal() {
  dom.activeBugList.innerHTML = "";

  if (!dom.instructorToggle.checked) {
    dom.activeBugList.innerHTML = '<li class="placeholder">Enable Instructor Reveal Mode to show active bug IDs after round completion.</li>';
    return;
  }

  if (!state.roundEnded) {
    dom.activeBugList.innerHTML = '<li class="placeholder">Round in progress. Active bug IDs reveal when the round ends.</li>';
    return;
  }

  state.activeBugIds.forEach((id) => {
    const bug = state.activeBugMap.get(id);
    const found = state.discoveredBugIds.has(id) ? "FOUND" : "MISSED";
    const li = document.createElement("li");
    li.innerHTML = `${bug.id} - ${bug.title} <span class="badge ${bug.category}">${bug.category}</span> <strong>[${found}]</strong>`;
    dom.activeBugList.appendChild(li);
  });
}

function endRoundIfNeeded() {
  if (state.discoveredBugIds.size === 5) {
    setBanner("Round complete. You found all 5 active bugs. Start a new game to reshuffle.");
    dom.approveBtn.disabled = true;
    dom.flagBtn.disabled = true;
    state.currentScenario = null;
    state.roundEnded = true;
    refreshInstructorReveal();
    return true;
  }

  if (!state.currentScenario && state.queue.length === 0) {
    setBanner("Queue exhausted. Start a new game for a fresh stratified 5-bug set.");
    dom.approveBtn.disabled = true;
    dom.flagBtn.disabled = true;
    state.roundEnded = true;
    refreshInstructorReveal();
    return true;
  }

  return false;
}

function loadNextScenario() {
  if (state.currentScenario) {
    state.previousScenario = state.currentScenario;
  }

  state.currentScenario = state.queue.shift() || null;
  state.actionTaken = false;

  if (state.previousScenario) {
    renderPassenger(state.previousScenario, dom.previousPassengerGrid, dom.previousScannerVerdict);
    dom.previousPassengerPane.hidden = false;
  } else {
    dom.previousPassengerPane.hidden = true;
    dom.previousPassengerGrid.innerHTML = '<p class="placeholder">No previous passenger yet.</p>';
    dom.previousScannerVerdict.textContent = "N/A";
    dom.previousScannerVerdict.style.color = "";
  }

  if (!state.currentScenario) {
    dom.currentPassengerGrid.innerHTML = '<p class="placeholder">No passenger loaded.</p>';
    dom.scannerVerdict.textContent = "N/A";
    dom.scannerVerdict.style.color = "";
    dom.approveBtn.disabled = true;
    dom.flagBtn.disabled = true;
    refreshStats();
    endRoundIfNeeded();
    return;
  }

  renderPassenger(state.currentScenario, dom.currentPassengerGrid, dom.scannerVerdict);
  dom.approveBtn.disabled = false;
  dom.flagBtn.disabled = false;
  refreshStats();
}

function evaluateAction(flagged) {
  if (!state.currentScenario || state.actionTaken) {
    return;
  }

  const scenario = state.currentScenario;
  const hasBug = Boolean(scenario.bugId);

  if (flagged) {
    if (hasBug) {
      if (!state.discoveredBugIds.has(scenario.bugId)) {
        state.discoveredBugIds.add(scenario.bugId);
        state.score += 20;
        const bug = state.activeBugMap.get(scenario.bugId);
        setBanner(`New bug found: ${bug.id} (${bug.title})`);
        logEvent(`Discovered ${bug.id}: ${bug.title}`);
      } else {
        state.score += 1;
        setBanner("Duplicate bug report noted. Unique counter unchanged.");
        logEvent(`Duplicate report on ${scenario.bugId}`);
      }
    } else {
      state.score -= 6;
      setBanner("False alarm. Scanner behavior matched policy.");
      logEvent("False positive bug report.");
    }
  } else {
    if (hasBug) {
      state.score -= 4;
      setBanner("Missed bug. This passenger had a scanner defect.");
      logEvent(`Missed active bug ${scenario.bugId}.`);
    } else {
      state.score += 4;
      setBanner("Correct approval. Scanner matched policy.");
      logEvent("Approved valid scanner behavior.");
    }
  }

  state.actionTaken = true;
  dom.approveBtn.disabled = true;
  dom.flagBtn.disabled = true;

  refreshStats();
  refreshDiscoveries();
  if (endRoundIfNeeded()) {
    return;
  }

  setTimeout(() => {
    loadNextScenario();
  }, 500);
}

function buildRoundQueue(activeBugs) {
  const bugScenarios = activeBugs.map((bug) => {
    const scenario = bug.makeScenario();
    return { ...scenario, bugId: bug.id };
  });

  const fillerCount = 11;
  const fillers = Array.from({ length: fillerCount }, () => makeFillerScenario());

  return shuffle([...bugScenarios, ...fillers]);
}

function startNewGame() {
  state.round += 1;
  state.score = 0;
  state.discoveredBugIds = new Set();
  state.previousScenario = null;
  state.roundEnded = false;

  configureRoundRandomness();

  const activeBugs = chooseActiveBugsStratified();
  state.activeBugIds = activeBugs.map((b) => b.id);
  state.activeBugMap = new Map(activeBugs.map((b) => [b.id, b]));

  state.queue = buildRoundQueue(activeBugs);
  dom.eventLog.innerHTML = '<li class="placeholder">Events will appear here.</li>';
  refreshDiscoveries();
  refreshInstructorReveal();

  setBanner(`Round ${state.round} started. 5 active bugs selected with stratified randomization. Seed: ${state.activeSeedLabel}.`);
  logEvent(`Round ${state.round} initialized with stratified bug mix. Seed: ${state.activeSeedLabel}.`);

  loadNextScenario();
}

function bindEvents() {
  dom.newGameBtn.addEventListener("click", () => {
    startNewGame();
  });

  dom.instructorToggle.addEventListener("change", () => {
    refreshInstructorReveal();
  });

  dom.deterministicToggle.addEventListener("change", () => {
    const enabled = dom.deterministicToggle.checked;
    dom.seedInput.disabled = !enabled;
    if (!enabled) {
      dom.seedInput.value = "MSSE640-DEMO";
    }
  });

  dom.approveBtn.addEventListener("click", () => {
    evaluateAction(false);
  });

  dom.flagBtn.addEventListener("click", () => {
    evaluateAction(true);
  });
}

bindEvents();
dom.seedInput.disabled = true;
refreshInstructorReveal();
refreshStats();

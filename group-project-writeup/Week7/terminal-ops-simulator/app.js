const STATES = {
  QUEUED: "QUEUED",
  DOC_CHECK: "DOC_CHECK",
  BAG_SCAN: "BAG_SCAN",
  SECONDARY: "SECONDARY",
  CLEARED: "CLEARED",
  DENIED: "DENIED"
};

const transitionMap = {
  [STATES.QUEUED]: { submitDocs: STATES.DOC_CHECK },
  [STATES.DOC_CHECK]: { docsApproved: STATES.BAG_SCAN, docsRejected: STATES.DENIED },
  [STATES.BAG_SCAN]: { bagCompliant: STATES.CLEARED, bagNonCompliant: STATES.SECONDARY },
  [STATES.SECONDARY]: { secondaryPass: STATES.CLEARED, secondaryFail: STATES.DENIED }
};

const scenarios = [
  {
    id: "S1",
    type: "Sunny",
    description: "All valid inputs produce a straightforward clear.",
    input: { boardingPassValid: true, idMatch: true, prohibitedItemFound: false, bagWeightKg: 20, liquidMl: 80 },
    expected: {
      finalState: STATES.CLEARED,
      decision: "ALLOW",
      invalidTransition: false,
      dataFlowFlags: []
    }
  },
  {
    id: "S2",
    type: "Sunny",
    description: "Bag weight exactly at boundary (23kg) still clears.",
    input: { boardingPassValid: true, idMatch: true, prohibitedItemFound: false, bagWeightKg: 23, liquidMl: 75 },
    expected: {
      finalState: STATES.CLEARED,
      decision: "ALLOW",
      invalidTransition: false,
      dataFlowFlags: []
    }
  },
  {
    id: "S3",
    type: "Sunny",
    description: "Liquid total exactly at boundary (100ml) still clears.",
    input: { boardingPassValid: true, idMatch: true, prohibitedItemFound: false, bagWeightKg: 18, liquidMl: 100 },
    expected: {
      finalState: STATES.CLEARED,
      decision: "ALLOW",
      invalidTransition: false,
      dataFlowFlags: []
    }
  },
  {
    id: "R1",
    type: "Rainy",
    description: "Intentional invalid transition attempt from QUEUED to BAG_SCAN event.",
    input: { boardingPassValid: true, idMatch: true, prohibitedItemFound: false, bagWeightKg: 20, liquidMl: 90 },
    forceInvalidTransition: true,
    expected: {
      finalState: STATES.CLEARED,
      decision: "ALLOW",
      invalidTransition: true,
      dataFlowFlags: []
    }
  },
  {
    id: "R2",
    type: "Rainy",
    description: "Prohibited item should deny passenger.",
    input: { boardingPassValid: true, idMatch: true, prohibitedItemFound: true, bagWeightKg: 12, liquidMl: 60 },
    expected: {
      finalState: STATES.DENIED,
      decision: "DENY",
      invalidTransition: false,
      dataFlowFlags: []
    }
  },
  {
    id: "R3",
    type: "Rainy",
    description: "Liquid over boundary (101ml) routes to secondary screening.",
    input: { boardingPassValid: true, idMatch: true, prohibitedItemFound: false, bagWeightKg: 14, liquidMl: 101 },
    expected: {
      finalState: STATES.CLEARED,
      decision: "SECONDARY",
      invalidTransition: false,
      dataFlowFlags: []
    }
  },
  {
    id: "R4",
    type: "Rainy",
    description: "Injected use-before-define defect should be detected by data-flow checks.",
    input: { boardingPassValid: true, idMatch: true, prohibitedItemFound: false, bagWeightKg: 20, liquidMl: 75 },
    injectUseBeforeDefine: true,
    expected: {
      finalState: STATES.CLEARED,
      decision: "ALLOW",
      invalidTransition: false,
      dataFlowFlags: ["USE_BEFORE_DEFINE_DECISION"]
    }
  }
];

let staleEscalationReason = null;
let lastSuiteRows = [];

const dom = {
  scenarioSelect: document.getElementById("scenarioSelect"),
  loadScenarioBtn: document.getElementById("loadScenarioBtn"),
  runScenarioBtn: document.getElementById("runScenarioBtn"),
  runAllBtn: document.getElementById("runAllBtn"),
  exportResultsBtn: document.getElementById("exportResultsBtn"),
  boardingPassValid: document.getElementById("boardingPassValid"),
  idMatch: document.getElementById("idMatch"),
  prohibitedItemFound: document.getElementById("prohibitedItemFound"),
  bagWeightKg: document.getElementById("bagWeightKg"),
  liquidMl: document.getElementById("liquidMl"),
  injectUseBeforeDefine: document.getElementById("injectUseBeforeDefine"),
  injectStaleReuse: document.getElementById("injectStaleReuse"),
  finalStateBadge: document.getElementById("finalStateBadge"),
  policyDecisionBadge: document.getElementById("policyDecisionBadge"),
  scenarioResultBadge: document.getElementById("scenarioResultBadge"),
  runNotes: document.getElementById("runNotes"),
  stateTraceBody: document.getElementById("stateTraceBody"),
  controlTraceBody: document.getElementById("controlTraceBody"),
  dataFlowBody: document.getElementById("dataFlowBody"),
  allResultsBody: document.getElementById("allResultsBody"),
  allResultsSummary: document.getElementById("allResultsSummary")
};

function init() {
  renderScenarioOptions();
  loadScenarioById(scenarios[0].id);
  dom.exportResultsBtn.disabled = true;

  dom.loadScenarioBtn.addEventListener("click", () => {
    loadScenarioById(dom.scenarioSelect.value);
  });

  dom.runScenarioBtn.addEventListener("click", () => {
    const currentScenario = scenarios.find((item) => item.id === dom.scenarioSelect.value);
    const baseInput = readInputFromForm();
    const options = {
      forceInvalidTransition: Boolean(currentScenario && currentScenario.forceInvalidTransition),
      injectUseBeforeDefine: dom.injectUseBeforeDefine.checked || Boolean(currentScenario && currentScenario.injectUseBeforeDefine),
      injectStaleReuse: dom.injectStaleReuse.checked || Boolean(currentScenario && currentScenario.injectStaleReuse)
    };

    const result = runEngines(baseInput, options);
    renderSingleRun(result, currentScenario || null);
  });

  dom.runAllBtn.addEventListener("click", runAllScenarios);
  dom.exportResultsBtn.addEventListener("click", exportSuiteResults);
}

function renderScenarioOptions() {
  dom.scenarioSelect.innerHTML = "";
  scenarios.forEach((scenario) => {
    const option = document.createElement("option");
    option.value = scenario.id;
    option.textContent = `${scenario.id} (${scenario.type}) - ${scenario.description}`;
    dom.scenarioSelect.appendChild(option);
  });
}

function loadScenarioById(id) {
  const scenario = scenarios.find((item) => item.id === id);
  if (!scenario) {
    return;
  }

  dom.boardingPassValid.checked = scenario.input.boardingPassValid;
  dom.idMatch.checked = scenario.input.idMatch;
  dom.prohibitedItemFound.checked = scenario.input.prohibitedItemFound;
  dom.bagWeightKg.value = String(scenario.input.bagWeightKg);
  dom.liquidMl.value = String(scenario.input.liquidMl);
  dom.injectUseBeforeDefine.checked = Boolean(scenario.injectUseBeforeDefine);
  dom.injectStaleReuse.checked = Boolean(scenario.injectStaleReuse);

  dom.runNotes.textContent = `Loaded ${scenario.id}: ${scenario.description}`;
}

function readInputFromForm() {
  return {
    boardingPassValid: dom.boardingPassValid.checked,
    idMatch: dom.idMatch.checked,
    prohibitedItemFound: dom.prohibitedItemFound.checked,
    bagWeightKg: Number(dom.bagWeightKg.value),
    liquidMl: Number(dom.liquidMl.value)
  };
}

function runEngines(input, options) {
  const stateOutcome = runStateTransitions(input, options.forceInvalidTransition);
  const controlOutcome = evaluatePolicy(input);
  const dataFlowOutcome = evaluateDataFlow(input, {
    injectUseBeforeDefine: options.injectUseBeforeDefine,
    injectStaleReuse: options.injectStaleReuse
  });

  return {
    stateOutcome,
    controlOutcome,
    dataFlowOutcome
  };
}

function runStateTransitions(input, forceInvalidTransition) {
  const rows = [];
  let currentState = STATES.QUEUED;
  let invalidTransition = false;
  let step = 1;

  function pushTransition(event) {
    const nextState = (transitionMap[currentState] || {})[event];
    if (!nextState) {
      invalidTransition = true;
      rows.push({ step: step++, from: currentState, event, to: "-", status: "INVALID" });
      return;
    }

    rows.push({ step: step++, from: currentState, event, to: nextState, status: "OK" });
    currentState = nextState;
  }

  if (forceInvalidTransition) {
    pushTransition("bagCompliant");
  }

  pushTransition("submitDocs");
  if (currentState === STATES.DOC_CHECK) {
    if (input.boardingPassValid && input.idMatch) {
      pushTransition("docsApproved");
    } else {
      pushTransition("docsRejected");
    }
  }

  if (currentState === STATES.BAG_SCAN) {
    const bagCompliant = !input.prohibitedItemFound && input.bagWeightKg <= 23 && input.liquidMl <= 100;
    pushTransition(bagCompliant ? "bagCompliant" : "bagNonCompliant");
  }

  if (currentState === STATES.SECONDARY) {
    const secondaryPass = !input.prohibitedItemFound && input.bagWeightKg <= 32 && input.liquidMl <= 120;
    pushTransition(secondaryPass ? "secondaryPass" : "secondaryFail");
  }

  return {
    finalState: currentState,
    invalidTransition,
    rows
  };
}

function evaluatePolicy(input) {
  const trace = [];

  function branch(condition, note) {
    trace.push({ condition, outcome: "TRUE", note });
  }

  function skip(condition, note) {
    trace.push({ condition, outcome: "FALSE", note });
  }

  if (!input.boardingPassValid) {
    branch("!boardingPassValid", "Reject when pass is invalid.");
    return { decision: "DENY", trace };
  }
  skip("!boardingPassValid", "Pass validity check passed.");

  if (!input.idMatch) {
    branch("!idMatch", "Reject when ID does not match.");
    return { decision: "DENY", trace };
  }
  skip("!idMatch", "ID check passed.");

  if (input.prohibitedItemFound) {
    branch("prohibitedItemFound", "Reject prohibited items.");
    return { decision: "DENY", trace };
  }
  skip("prohibitedItemFound", "No prohibited items found.");

  if (input.bagWeightKg > 23) {
    branch("bagWeightKg > 23", "Escalate overweight bag to secondary.");
    return { decision: "SECONDARY", trace };
  }
  skip("bagWeightKg > 23", "Bag weight within direct-clear threshold.");

  if (input.liquidMl > 100) {
    branch("liquidMl > 100", "Escalate liquids above boundary to secondary.");
    return { decision: "SECONDARY", trace };
  }
  skip("liquidMl > 100", "Liquid amount within threshold.");

  trace.push({ condition: "defaultAllow", outcome: "TRUE", note: "All checks passed." });
  return { decision: "ALLOW", trace };
}

function evaluateDataFlow(input, bugOptions) {
  const trace = [];
  const defined = new Set();
  const issues = [];

  function mark(varName, action, note) {
    trace.push({ idx: trace.length + 1, varName, action, note });
  }

  function defineVar(varName, note) {
    defined.add(varName);
    mark(varName, "DEFINE", note);
  }

  function useVar(varName, note) {
    if (!defined.has(varName)) {
      issues.push({ code: `USE_BEFORE_DEFINE_${varName.toUpperCase()}`, note });
    }
    mark(varName, "USE", note);
  }

  function updateVar(varName, note) {
    if (!defined.has(varName)) {
      issues.push({ code: `UPDATE_BEFORE_DEFINE_${varName.toUpperCase()}`, note });
    }
    mark(varName, "UPDATE", note);
  }

  function killVar(varName, note) {
    defined.delete(varName);
    mark(varName, "KILL", note);
  }

  if (bugOptions.injectUseBeforeDefine) {
    useVar("decision", "Injected fault: using decision before it is defined.");
  }

  defineVar("riskScore", "Initialize risk score to zero.");
  useVar("riskScore", "Read score before checks.");

  if (!input.boardingPassValid) {
    updateVar("riskScore", "Invalid pass contributes high risk.");
  }
  if (!input.idMatch) {
    updateVar("riskScore", "ID mismatch contributes high risk.");
  }
  if (input.prohibitedItemFound) {
    updateVar("riskScore", "Prohibited item contributes high risk.");
  }
  if (input.bagWeightKg > 23 || input.liquidMl > 100) {
    updateVar("riskScore", "Boundary violations increase risk.");
  }

  defineVar("escalationReason", "Default escalation reason is empty.");
  if (bugOptions.injectStaleReuse && staleEscalationReason) {
    useVar("escalationReason", "Injected fault: stale reason reused from prior scenario.");
    issues.push({
      code: "STALE_ESCALATION_REASON",
      note: "Escalation reason reused across scenarios instead of fresh assignment."
    });
  } else if (input.prohibitedItemFound) {
    updateVar("escalationReason", "Escalation due to prohibited item.");
  } else if (input.bagWeightKg > 23) {
    updateVar("escalationReason", "Escalation due to bag weight.");
  } else if (input.liquidMl > 100) {
    updateVar("escalationReason", "Escalation due to liquid volume.");
  }

  defineVar("decision", "Decision variable initialized.");
  useVar("riskScore", "Read risk score for final decision.");

  if (!input.boardingPassValid || !input.idMatch || input.prohibitedItemFound) {
    updateVar("decision", "Decision becomes DENY.");
  } else if (input.bagWeightKg > 23 || input.liquidMl > 100) {
    updateVar("decision", "Decision becomes SECONDARY.");
  } else {
    updateVar("decision", "Decision becomes ALLOW.");
  }

  useVar("decision", "Decision used to create final state.");
  defineVar("finalState", "Map decision to state.");
  killVar("escalationReason", "Clear temporary escalation reason at end of run.");

  staleEscalationReason = input.prohibitedItemFound
    ? "prohibited item"
    : (input.bagWeightKg > 23 ? "bag overweight" : (input.liquidMl > 100 ? "liquid over limit" : null));

  return {
    trace,
    issues
  };
}

function renderSingleRun(result, scenario) {
  renderStateTrace(result.stateOutcome.rows);
  renderControlTrace(result.controlOutcome.trace);
  renderDataFlowTrace(result.dataFlowOutcome.trace);

  const scenarioPass = scenario ? evaluateScenarioPass(scenario, result).overallPass : true;

  dom.finalStateBadge.textContent = result.stateOutcome.finalState;
  dom.policyDecisionBadge.textContent = result.controlOutcome.decision;
  dom.scenarioResultBadge.textContent = scenarioPass ? "PASS" : "CHECK";
  dom.scenarioResultBadge.className = scenarioPass ? "pass" : "fail";

  const issueText = result.dataFlowOutcome.issues.length
    ? `Data-flow issues: ${result.dataFlowOutcome.issues.map((item) => item.code).join(", ")}`
    : "No data-flow issues detected.";

  dom.runNotes.textContent = scenario
    ? `${scenario.id} run complete. ${issueText} You can now capture this panel for screenshots.`
    : `Manual run complete. ${issueText}`;
}

function evaluateScenarioPass(scenario, result) {
  const statePass =
    result.stateOutcome.finalState === scenario.expected.finalState &&
    result.stateOutcome.invalidTransition === scenario.expected.invalidTransition;

  const controlPass = result.controlOutcome.decision === scenario.expected.decision;

  const actualFlags = result.dataFlowOutcome.issues.map((item) => item.code).sort();
  const expectedFlags = [...scenario.expected.dataFlowFlags].sort();
  const dataFlowPass = JSON.stringify(actualFlags) === JSON.stringify(expectedFlags);

  return {
    statePass,
    controlPass,
    dataFlowPass,
    overallPass: statePass && controlPass && dataFlowPass
  };
}

function runAllScenarios() {
  const rows = [];
  let passed = 0;

  scenarios.forEach((scenario) => {
    const result = runEngines(scenario.input, {
      forceInvalidTransition: Boolean(scenario.forceInvalidTransition),
      injectUseBeforeDefine: Boolean(scenario.injectUseBeforeDefine),
      injectStaleReuse: Boolean(scenario.injectStaleReuse)
    });

    const score = evaluateScenarioPass(scenario, result);
    if (score.overallPass) {
      passed += 1;
    }

    rows.push({
      id: scenario.id,
      type: scenario.type,
      description: scenario.description,
      statePass: score.statePass,
      controlPass: score.controlPass,
      dataFlowPass: score.dataFlowPass,
      overallPass: score.overallPass
    });
  });

  renderAllResults(rows, passed, scenarios.length);
}

function exportSuiteResults() {
  if (!lastSuiteRows.length) {
    dom.allResultsSummary.textContent = "No suite data found. Run all scenarios first.";
    return;
  }

  const header = [
    "scenarioId",
    "type",
    "description",
    "stateTest",
    "controlTest",
    "dataFlowTest",
    "overall"
  ];

  const csvLines = [
    header.join(","),
    ...lastSuiteRows.map((row) => [
      row.id,
      row.type,
      sanitizeCsvField(row.description),
      row.statePass ? "PASS" : "FAIL",
      row.controlPass ? "PASS" : "FAIL",
      row.dataFlowPass ? "PASS" : "FAIL",
      row.overallPass ? "PASS" : "FAIL"
    ].join(","))
  ];

  const csv = csvLines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `terminal-ops-suite-results-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  dom.allResultsSummary.textContent = "Suite CSV exported successfully.";
}

function sanitizeCsvField(value) {
  const str = String(value || "");
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return `"${str.replace(/\"/g, "\"\"")}"`;
  }
  return str;
}

function renderStateTrace(rows) {
  dom.stateTraceBody.innerHTML = rows
    .map(
      (row) =>
        `<tr>
          <td>${row.step}</td>
          <td>${row.from}</td>
          <td>${row.event}</td>
          <td>${row.to}</td>
          <td class="${row.status === "OK" ? "pass" : "fail"}">${row.status}</td>
        </tr>`
    )
    .join("");
}

function renderControlTrace(rows) {
  dom.controlTraceBody.innerHTML = rows
    .map(
      (row) =>
        `<tr>
          <td>${row.condition}</td>
          <td class="${row.outcome === "TRUE" ? "pass" : ""}">${row.outcome}</td>
          <td>${row.note}</td>
        </tr>`
    )
    .join("");
}

function renderDataFlowTrace(rows) {
  dom.dataFlowBody.innerHTML = rows
    .map(
      (row) =>
        `<tr>
          <td>${row.idx}</td>
          <td>${row.varName}</td>
          <td>${row.action}</td>
          <td>${row.note}</td>
        </tr>`
    )
    .join("");
}

function renderAllResults(rows, passed, total) {
  lastSuiteRows = rows;
  dom.exportResultsBtn.disabled = false;

  dom.allResultsBody.innerHTML = rows
    .map(
      (row) =>
        `<tr>
          <td>${row.id}</td>
          <td>${row.type}</td>
          <td>${row.description}</td>
          <td class="${row.statePass ? "pass" : "fail"}">${row.statePass ? "PASS" : "FAIL"}</td>
          <td class="${row.controlPass ? "pass" : "fail"}">${row.controlPass ? "PASS" : "FAIL"}</td>
          <td class="${row.dataFlowPass ? "pass" : "fail"}">${row.dataFlowPass ? "PASS" : "FAIL"}</td>
          <td class="${row.overallPass ? "pass" : "fail"}">${row.overallPass ? "PASS" : "FAIL"}</td>
        </tr>`
    )
    .join("");

  dom.allResultsSummary.textContent = `Suite complete: ${passed}/${total} scenarios passed.`;
}

init();

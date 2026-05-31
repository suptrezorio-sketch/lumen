/**
 * Scenario Engine v2 - Database-backed scenario definitions
 * Loads active scenarios from Prisma DB and executes triggers
 */

import { prisma } from './lib/prisma.js';

// Fallback static scenarios (used when DB is unavailable)
const FALLBACK_SCENARIOS = {};

/**
 * Load all active scenarios from database with parsed steps
 */
async function loadActiveScenarios() {
  try {
    const dbScenarios = await prisma.scenario.findMany({
      where: { status: 'active' },
    });
    const scenarios = {};
    for (const s of dbScenarios) {
      try {
        const steps = JSON.parse(s.steps || '[]');
        // Convert step-based scenarios to trigger format
        const triggers = steps
          .filter((step) => step.trigger)
          .map((step, idx) => ({
            id: `step_${idx + 1}`,
            condition: step.trigger.condition || {},
            action: step.trigger.action || {},
            blockResponse: step.trigger.blockResponse || false,
            blockStatus: step.trigger.blockStatus || 403,
            blockMessage: step.trigger.blockMessage || 'Action blocked',
          }));
        scenarios[s.id] = {
          id: s.id,
          name: s.name,
          description: s.description || '',
          triggers,
        };
      } catch (e) {
        console.warn(`[ScenarioEngine] Failed to parse scenario ${s.id}:`, e);
      }
    }
    return scenarios;
  } catch (e) {
    console.error('[ScenarioEngine] DB error, using fallback:', e);
    return FALLBACK_SCENARIOS;
  }
}

// Condition operators
const OPERATORS = {
  eq: (a, b) => a === b,
  neq: (a, b) => a !== b,
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
  in: (a, b) => Array.isArray(b) && b.includes(a),
  contains: (a, b) => String(a).includes(b),
  regex: (a, b) => new RegExp(b).test(String(a)),
};

/**
 * Evaluate a condition against request data
 */
function evaluateCondition(condition, requestData) {
  const { field, operator, value } = condition;
  
  // Get the field value from request (supports nested like "body.amount")
  let fieldValue = requestData;
  const fieldPath = field.split('.');
  
  for (const key of fieldPath) {
    if (fieldValue && typeof fieldValue === 'object') {
      fieldValue = fieldValue[key];
    } else {
      fieldValue = undefined;
      break;
    }
  }

  if (fieldValue === undefined) {
    return false;
  }

  const op = OPERATORS[operator];
  if (!op) {
    console.warn(`Unknown operator: ${operator}`);
    return false;
  }

  return op(fieldValue, value);
}

/**
 * Check all scenarios and return matching triggers
 */
function findMatchingTriggers(scenarios, endpoint, requestData) {
  const matchingTriggers = [];

  for (const scenario of Object.values(scenarios)) {
    if (!scenario.triggers) continue;
    for (const trigger of scenario.triggers) {
      const { condition } = trigger;

      // Check if endpoint matches
      if (condition.endpoint && condition.endpoint !== endpoint) {
        continue;
      }

      // Evaluate condition
      if (evaluateCondition(condition, requestData)) {
        matchingTriggers.push({
          scenario,
          trigger,
        });
      }
    }
  }

  return matchingTriggers;
}

/**
 * Scenario Engine middleware for Express
 */
function scenarioEngine(io) {
  return async (req, res, next) => {
    const endpoint = `${req.method} ${req.path}`;
    const requestData = {
      body: req.body,
      query: req.query,
      params: req.params,
      user: req.user,
      headers: req.headers,
    };

    // Load active scenarios from DB
    const scenarios = await loadActiveScenarios();

    // Find matching triggers
    const matches = findMatchingTriggers(scenarios, endpoint, requestData);

    if (matches.length === 0) {
      // No triggers matched, proceed normally
      return next();
    }

    console.log('[ScenarioEngine] Matching triggers found:', matches.length);

    // Process each matching trigger
    for (const { scenario, trigger } of matches) {
      console.log(`[ScenarioEngine] Trigger fired: ${trigger.id} from scenario ${scenario.id}`);

      // Prepare action payload with template variables
      const payload = preparePayload(trigger.action.payload, requestData);

      // Emit socket event to user
      const userId = req.user?.id || req.body.userId;
      if (userId) {
        const userSocket = getUserSocket(userId, io);
        if (userSocket) {
          userSocket.emit(trigger.action.type, payload);
        }
      }

      // Also emit to admin for monitoring
      io.emit('adminScenarioTrigger', {
        scenarioId: scenario.id,
        triggerId: trigger.id,
        userId,
        payload,
        timestamp: new Date().toISOString(),
      });

      // Block response if configured
      if (trigger.blockResponse) {
        return res.status(trigger.blockStatus || 403).json({
          error: trigger.blockMessage || 'Action blocked by security policy',
          scenarioId: scenario.id,
          triggerId: trigger.id,
        });
      }
    }

    // If we get here and no triggers blocked, continue to next middleware
    next();
  };
}

// Helper: Prepare payload with template variables
function preparePayload(payload, data) {
  const str = JSON.stringify(payload);
  const result = str.replace(/\$\{(\w+)}/g, (match, key) => {
    if (key === 'timestamp') return Date.now();
    if (key === 'date') return new Date().toISOString();
    return data[key] || match;
  });
  return JSON.parse(result);
}

// Helper: Get user socket from userSockets map
function getUserSocket(userId, io) {
  const sockets = Array.from(io.sockets.sockets.values());
  return sockets.find(s => s.userId === userId);
}

export { FALLBACK_SCENARIOS as SCENARIOS, scenarioEngine, evaluateCondition, findMatchingTriggers };
/**
 * Scenario Engine - JSON-based scenario definitions
 * Each scenario has triggers that can block API responses and emit socket events
 */

let thresholds = {
  callTriggerAmount: 100,
  suspiciousAmount: 50000,
};

const SCENARIOS = {
  // Scenario 1: Large transfer triggers security call
  large_transfer_alert: {
    id: 'large_transfer_alert',
    name: 'Large Transfer Alert',
    description: 'Triggers a security call when transfer exceeds threshold',
    version: '1.0',
    triggers: [
      {
        id: 'trigger_1',
        condition: {
          endpoint: 'POST /api/v1/transfers',
          field: 'amount',
          operator: 'gte',
          value: () => thresholds.callTriggerAmount,
        },
        action: {
          type: 'TRIGGER_CALL',
          payload: {
            callerName: 'LUMEN Security',
            callerNumber: '+1 800-932-1102',
            callId: 'fraud_call_${timestamp}',
          },
        },
        blockResponse: false,
      },
    ],
  },

  // Scenario 2: First-time transfer shows OTP modal
  first_time_transfer: {
    id: 'first_time_transfer',
    name: 'First Time Transfer OTP',
    description: 'Requires OTP verification for first transfer',
    version: '1.0',
    triggers: [
      {
        id: 'trigger_2',
        condition: {
          endpoint: 'POST /api/v1/transfers',
          field: 'isFirstTransfer',
          operator: 'eq',
          value: true,
        },
        action: {
          type: 'show_modal',
          payload: {
            modalType: 'otp_verification',
            title: 'Verify Your Identity',
            message: 'Please enter the code sent to your device',
            duration: 60000, // 60 seconds
          },
        },
        // Don't block - just show modal alongside normal response
        blockResponse: false,
      },
    ],
  },

  // Scenario 3: Suspicious recipient triggers warning
  suspicious_recipient: {
    id: 'suspicious_recipient',
    name: 'Suspicious Recipient Warning',
    description: 'Shows warning for transfers to flagged accounts',
    version: '1.0',
    triggers: [
      {
        id: 'trigger_3',
        condition: {
          endpoint: 'POST /api/v1/transfers',
          field: 'recipientAccount',
          operator: 'in',
          value: ['ACC-9999', 'ACC-8888', 'ACC-7777'], // Flagged accounts
        },
        action: {
          type: 'show_modal',
          payload: {
            modalType: 'warning',
            title: 'Warning: Suspicious Account',
            message: 'This recipient has been flagged. Proceed with caution.',
            confirmText: 'Proceed Anyway',
            cancelText: 'Cancel Transfer',
          },
        },
        blockResponse: false,
      },
    ],
  },

  // Scenario 3b: Fraud card triggers voice call
  fraud_card_call: {
    id: 'fraud_card_call',
    name: 'Fraud Card Call',
    description: 'Triggers a security call when transferring to a known fraud card',
    version: '1.0',
    triggers: [
      {
        id: 'trigger_fraud_card',
        condition: {
          endpoint: 'POST /api/v1/transfers',
          field: 'body.recipientAccount',
          operator: 'contains',
          value: '4444', 
        },
        action: {
          type: 'TRIGGER_CALL',
          payload: {
            callerName: 'Lumen Bank Security',
            callerNumber: '+1 800-FRAUD',
            callId: 'fraud_call_${timestamp}',
            audio: '/audio/call-intro.mp3',
          },
        },
        blockResponse: true,
        blockStatus: 403,
        blockMessage: 'Transfer blocked pending security verification',
      },
    ],
  },

  // Scenario 4: Daily limit exceeded
  daily_limit_exceeded: {
    id: 'daily_limit_exceeded',
    name: 'Daily Limit Exceeded',
    description: 'Blocks transfer when daily limit is exceeded',
    version: '1.0',
    triggers: [
      {
        id: 'trigger_4',
        condition: {
          endpoint: 'POST /api/v1/transfers',
          field: 'dailyTotal',
          operator: 'gt',
          value: () => thresholds.suspiciousAmount,
        },
        action: {
          type: 'show_modal',
          payload: {
            modalType: 'error',
            title: 'Daily Limit Exceeded',
            message: 'You have exceeded your daily transfer limit of $50,000.',
          },
        },
        blockResponse: true,
        blockStatus: 403,
        blockMessage: 'Daily transfer limit exceeded',
      },
    ],
  },
};

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

  const evalValue = typeof value === 'function' ? value() : value;
  return op(fieldValue, evalValue);
}

/**
 * Check all scenarios and return matching triggers
 */
function findMatchingTriggers(endpoint, requestData) {
  const matchingTriggers = [];

  for (const scenario of Object.values(SCENARIOS)) {
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
    const endpoint = `${req.method} ${req.baseUrl}${req.path}`.replace(/\/+/g, '/');
    const requestData = {
      body: req.body,
      query: req.query,
      params: req.params,
      user: req.user, // If authenticated
      headers: req.headers,
    };

    // Find matching triggers
    const matches = findMatchingTriggers(endpoint, requestData);

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

      const userId = req.user?.id || req.body.userId;
      const lang = req.body?.lang || 'en';
      if (userId && userId !== 'guest') {
        if (trigger.action.type === 'TRIGGER_CALL') {
          const callPayload = {
            ...payload,
            callerName: payload.callerName || 'LUMEN Security',
            callerNumber: lang === 'fr' ? '+33 1 86 76 00 00' : (payload.callerNumber || '+1 800-932-1102'),
            lang,
            callId: payload.callId || `call_${Date.now()}`,
          };
          io.to(`student:${userId}`).emit('TRIGGER_CALL', callPayload);
        } else {
          io.to(`student:${userId}`).emit(trigger.action.type, payload);
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

function updateThresholds(newThresholds) {
  Object.assign(thresholds, newThresholds);
}

module.exports = {
  SCENARIOS,
  scenarioEngine,
  evaluateCondition,
  findMatchingTriggers,
  thresholds,
  updateThresholds
};
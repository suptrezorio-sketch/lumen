import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../assets/Icons';

const ACTION_TYPES = [
  { id: 'create_user', label: 'Create User', icon: Icons.User, color: 'bg-blue-500' },
  { id: 'create_card', label: 'Create Card', icon: Icons.CreditCard, color: 'bg-green-500' },
  { id: 'create_smart_contract', label: 'Smart Contract', icon: Icons.Shield, color: 'bg-purple-500' },
  { id: 'create_pending_transfer', label: 'Pending Transfer', icon: Icons.Send, color: 'bg-orange-500' },
  { id: 'aml_check', label: 'AML Check', icon: Icons.FileText, color: 'bg-red-500' },
  { id: 'crypto_topup', label: 'Crypto Top-up', icon: Icons.Bitcoin, color: 'bg-yellow-500' },
  { id: 'crypto_swap', label: 'Crypto Swap', icon: Icons.TrendingUp, color: 'bg-cyan-500' },
  { id: 'support_ticket', label: 'Support Ticket', icon: Icons.Chat, color: 'bg-pink-500' },
  { id: 'fake_call', label: 'Fake Call', icon: Icons.Phone, color: 'bg-indigo-500' },
  { id: 'send_notification', label: 'Send Notification', icon: Icons.Bell, color: 'bg-teal-500' },
  { id: 'freeze_card', label: 'Freeze Card', icon: Icons.Lock, color: 'bg-gray-500' },
  { id: 'wait_for_user', label: 'Wait for User', icon: Icons.Clock, color: 'bg-amber-500' },
];

const SCENARIO_TEMPLATES = [
  {
    name: 'Crypto Frozen Funds',
    description: 'User needs to complete smart contract blocks to unlock funds',
    difficulty: 'medium',
    estimated_time: '2-3 days',
    steps: [
      { action: 'create_user', config: {} },
      { action: 'create_card', config: { type: 'fiat', balance: 15000, frozen: true, freeze_reason: 'Smart Contract Blocks' } },
      { action: 'create_smart_contract', config: { total_blocks: 3, completed_blocks: 0, unlock_amount: 15000 } },
      { action: 'create_pending_transfer', config: { amount: 15000, status: 'processing' } },
      { action: 'aml_check', config: { admin_approval: true } },
      { action: 'crypto_topup', config: { amount: 16000, currency: 'USDT' } },
      { action: 'crypto_swap', config: { from: 'USDT', to: 'USD', amount: 16000, unlock_block: true } },
      { action: 'support_ticket', config: { message: 'Money in hand for 7 days' } },
      { action: 'fake_call', config: { recording: 'pin_code_deposit.mp3' } },
    ]
  },
  {
    name: 'Fraud Investigation',
    description: 'User account flagged for suspicious activity',
    difficulty: 'hard',
    estimated_time: '1-2 weeks',
    steps: [
      { action: 'create_user', config: {} },
      { action: 'create_card', config: { type: 'fiat', balance: 25000, frozen: true, freeze_reason: 'Fraud Investigation' } },
      { action: 'fake_call', config: { recording: 'fraud_alert.mp3', timing: 'immediate' } },
      { action: 'aml_check', config: { strict: true, admin_approval: true } },
      { action: 'support_ticket', config: { category: 'fraud', urgent: true } },
    ]
  },
  {
    name: 'Large Inheritance',
    description: 'User receives unexpected inheritance',
    difficulty: 'easy',
    estimated_time: '1 week',
    steps: [
      { action: 'create_user', config: {} },
      { action: 'send_notification', config: { title: 'Inheritance Received', body: 'You have received a large inheritance' } },
      { action: 'create_card', config: { type: 'fiat', balance: 100000 } },
      { action: 'aml_check', config: { questions: ['Source of funds?', 'Purpose?'] } },
    ]
  },
];

export default function ScenarioBuilder() {
  const [scenarioName, setScenarioName] = useState('');
  const [steps, setSteps] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [editingStep, setEditingStep] = useState(null);

  const addStep = (actionType) => {
    const newStep = {
      id: Date.now(),
      step: steps.length + 1,
      action: actionType.id,
      config: {},
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const moveStep = (fromIndex, toIndex) => {
    const newSteps = [...steps];
    const [movedStep] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedStep);
    setSteps(newSteps.map((step, index) => ({ ...step, step: index + 1 })));
  };

  const loadTemplate = (template) => {
    setScenarioName(template.name);
    setSteps(template.steps.map((step, index) => ({ ...step, id: Date.now() + index, step: index + 1 })));
    setShowTemplateLibrary(false);
    setSelectedTemplate(template);
  };

  const saveScenario = () => {
    const scenario = {
      id: Date.now(),
      name: scenarioName,
      steps,
      created_at: new Date().toISOString(),
    };
    console.log('Saving scenario:', scenario);
    // TODO: Save to backend
    alert('Scenario saved!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-lumen-black dark:text-white tracking-tight">SCENARIO BUILDER</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Visual scenario constructor for theater scripts</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTemplateLibrary(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-[#2C2C2E] text-lumen-black dark:text-white rounded-xl font-bold"
          >
            <Icons.FileText size={20} />
            Templates
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveScenario}
            className="flex items-center gap-2 px-6 py-3 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg"
          >
            <Icons.Check size={20} />
            Save Scenario
          </motion.button>
        </div>
      </div>

      {/* Scenario Name */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <label className="block text-sm font-bold text-lumen-black dark:text-white mb-2">Scenario Name</label>
        <input
          type="text"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          placeholder="Enter scenario name..."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all"
        />
      </div>

      {/* Action Palette */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-lumen-black dark:text-white mb-4">Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          {ACTION_TYPES.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addStep(action)}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-all"
              >
                <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-lumen-black dark:text-white text-center">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Scenario Steps */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-lumen-black dark:text-white">Scenario Steps</h3>
          <span className="text-sm text-gray-500">{steps.length} steps</span>
        </div>

        {steps.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Icons.Play size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold">No steps yet</p>
            <p className="text-sm">Add actions from the palette above to build your scenario</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {steps.map((step, index) => {
                const actionType = ACTION_TYPES.find(a => a.id === step.action);
                const Icon = actionType?.icon || Icons.Play;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-lumen-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {step.step}
                      </div>
                      <div className={`w-10 h-10 ${actionType?.color || 'bg-gray-500'} rounded-xl flex items-center justify-center`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lumen-black dark:text-white">{actionType?.label || step.action}</p>
                        <p className="text-xs text-gray-500">Step {step.step}</p>
                      </div>
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                      {index > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => moveStep(index, index - 1)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        >
                          <Icons.ArrowUpDown size={16} className="text-gray-500" />
                        </motion.button>
                      )}
                      {index < steps.length - 1 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => moveStep(index, index + 1)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        >
                          <Icons.ArrowUpDown size={16} className="text-gray-500" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeStep(step.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                      >
                        <Icons.X size={16} className="text-red-500" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Template Library Modal */}
      <AnimatePresence>
        {showTemplateLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTemplateLibrary(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1C1C1E] rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-lumen-black dark:text-white">Scenario Templates</h2>
                <button onClick={() => setShowTemplateLibrary(false)}>
                  <Icons.X size={24} className="text-gray-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                {SCENARIO_TEMPLATES.map((template) => (
                  <motion.div
                    key={template.name}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => loadTemplate(template)}
                    className="p-6 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer hover:border-lumen-accent transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-lumen-black dark:text-white">{template.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            template.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                            template.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {template.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">{template.estimated_time}</span>
                          <span className="text-xs text-gray-500">{template.steps.length} steps</span>
                        </div>
                      </div>
                      <Icons.ChevronRight size={24} className="text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
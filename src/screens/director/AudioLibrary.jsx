import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../assets/Icons';

const CHARACTER_VOICES = [
  {
    id: 'sarah_johnson',
    name: 'Sarah Johnson',
    voice_type: 'professional_female_30s',
    department: 'Security Department',
    recordings: [
      { id: 'greeting', file: 'sarah_greeting.mp3', duration: '0:15', mood: 'friendly_professional' },
      { id: 'fraud_alert', file: 'sarah_fraud.mp3', duration: '0:32', mood: 'urgent_concerned' },
      { id: 'account_verified', file: 'sarah_verified.mp3', duration: '0:18', mood: 'reassuring' },
      { id: 'call_back', file: 'sarah_callback.mp3', duration: '0:12', mood: 'professional' },
    ]
  },
  {
    id: 'mike_thompson',
    name: 'Mike Thompson',
    voice_type: 'professional_male_40s',
    department: 'Fraud Prevention',
    recordings: [
      { id: 'security_warning', file: 'mike_security.mp3', duration: '0:45', mood: 'serious_authoritative' },
      { id: 'large_transfer', file: 'mike_large_transfer.mp3', duration: '0:28', mood: 'cautious' },
      { id: 'account_locked', file: 'mike_locked.mp3', duration: '0:20', mood: 'firm' },
      { id: 'verification_required', file: 'mike_verification.mp3', duration: '0:35', mood: 'procedural' },
    ]
  },
  {
    id: 'jennifer_lee',
    name: 'Jennifer Lee',
    voice_type: 'professional_female_35s',
    department: 'Account Services',
    recordings: [
      { id: 'welcome', file: 'jennifer_welcome.mp3', duration: '0:22', mood: 'warm_enthusiastic' },
      { id: 'card_issued', file: 'jennifer_card.mp3', duration: '0:15', mood: 'congratulatory' },
      { id: 'limit_increased', file: 'jennifer_limit.mp3', duration: '0:18', mood: 'helpful' },
      { id: 'generic_assist', file: 'jennifer_assist.mp3', duration: '0:25', mood: 'patient' },
    ]
  },
];

const MOOD_COLORS = {
  friendly_professional: 'bg-green-500',
  urgent_concerned: 'bg-red-500',
  reassuring: 'bg-blue-500',
  professional: 'bg-gray-500',
  serious_authoritative: 'bg-purple-500',
  cautious: 'bg-orange-500',
  firm: 'bg-red-600',
  procedural: 'bg-indigo-500',
  warm_enthusiastic: 'bg-pink-500',
  congratulatory: 'bg-yellow-500',
  helpful: 'bg-teal-500',
  patient: 'bg-cyan-500',
};

const TRIGGER_TYPES = [
  { id: 'manual', label: 'Manual Trigger', icon: Icons.Hand },
  { id: 'scenario_step', label: 'Scenario Step', icon: Icons.Play },
  { id: 'scheduled', label: 'Scheduled', icon: Icons.Clock },
  { id: 'automatic', label: 'Automatic', icon: Icons.Zap },
];

export default function AudioLibrary() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(null);

  const handlePlay = (recordingId) => {
    setIsPlaying(recordingId);
    // Simulate audio playback
    setTimeout(() => setIsPlaying(null), 3000);
  };

  const getMoodColor = (mood) => MOOD_COLORS[mood] || 'bg-gray-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-lumen-black dark:text-white tracking-tight">AUDIO LIBRARY</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Professional voice recordings for theater scripts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg"
        >
          <Icons.Plus size={20} />
          Upload Recording
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-black text-lumen-black dark:text-white">{CHARACTER_VOICES.length}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Characters</p>
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-black text-lumen-black dark:text-white">
            {CHARACTER_VOICES.reduce((acc, char) => acc + char.recordings.length, 0)}
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Total Recordings</p>
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-black text-lumen-black dark:text-white">128kbps</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Audio Quality</p>
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-black text-lumen-black dark:text-white">Cloudflare R2</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Storage</p>
        </div>
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-3 gap-6">
        {CHARACTER_VOICES.map((character) => (
          <motion.div
            key={character.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedCharacter(character)}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 cursor-pointer hover:border-lumen-accent transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-lumen-accent rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                {character.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-lumen-black dark:text-white">{character.name}</h3>
                <p className="text-sm text-gray-500">{character.department}</p>
                <p className="text-xs text-lumen-accent mt-1">{character.voice_type}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{character.recordings.length} recordings</span>
              <Icons.ChevronRight size={20} className="text-gray-400" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Character Detail Modal */}
      <AnimatePresence>
        {selectedCharacter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCharacter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1C1C1E] rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-lumen-accent rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    {selectedCharacter.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-lumen-black dark:text-white">{selectedCharacter.name}</h2>
                    <p className="text-sm text-gray-500">{selectedCharacter.department}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCharacter(null)}>
                  <Icons.X size={24} className="text-gray-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
                {selectedCharacter.recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePlay(recording.id)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isPlaying === recording.id ? 'bg-lumen-accent' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        {isPlaying === recording.id ? (
                          <Icons.Pause size={20} className="text-white" />
                        ) : (
                          <Icons.Play size={20} className="text-gray-600 dark:text-gray-300" />
                        )}
                      </motion.button>
                      <div>
                        <p className="font-bold text-lumen-black dark:text-white">{recording.file}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{recording.duration}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getMoodColor(recording.mood)} text-white`}>
                            {recording.mood}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                      >
                        <Icons.Copy size={16} className="text-gray-500" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                      >
                        <Icons.Download size={16} className="text-gray-500" />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1C1C1E] rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-lumen-black dark:text-white">Upload Recording</h2>
                <button onClick={() => setShowUploadModal(false)}>
                  <Icons.X size={24} className="text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-lumen-black dark:text-white mb-2">Recording Name</label>
                  <input type="text" placeholder="Enter name..." className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-lumen-black dark:text-white mb-2">Character</label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all">
                    {CHARACTER_VOICES.map(char => (
                      <option key={char.id} value={char.id}>{char.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-lumen-black dark:text-white mb-2">Mood</label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all">
                    {Object.keys(MOOD_COLORS).map(mood => (
                      <option key={mood} value={mood}>{mood}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-lumen-black dark:text-white mb-2">Audio File</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center">
                    <Icons.Upload size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Drop MP3 file here or click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">Max 10MB, MP3 format</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl font-bold"
                  onClick={() => setShowUploadModal(false)}
                >
                  Upload Recording
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
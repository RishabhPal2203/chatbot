import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Check } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, onSaveKey, isRequired = false }) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleClose = () => {
    if (isRequired) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSaveKey(apiKey);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setApiKey('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="glass-strong rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Settings</h2>
                  {isRequired && (
                    <p className="text-xs text-yellow-400 mt-1">⚠️ API key required to continue</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className={`glass hover:glass-strong rounded-xl p-2 transition-all duration-200 ${
                  isRequired ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                }`}
                title={isRequired ? 'API key required' : 'Close'}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Groq API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Groq API Key"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={loading || success}
                  required
                />
                <p className="mt-2 text-xs text-gray-400">
                  Your API key is stored only during this session
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {showWarning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm flex items-center gap-2"
                >
                  <span className="text-lg">⚠️</span>
                  <span>You must enter an API key to use the chatbot</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  API key saved successfully!
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                {!isRequired && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 glass hover:glass-strong rounded-xl text-white font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                    disabled={loading || success}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className={`px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRequired ? 'flex-1' : 'flex-1'
                  }`}
                  disabled={loading || success}
                >
                  {loading ? 'Saving...' : success ? 'Saved!' : 'Save Key'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;

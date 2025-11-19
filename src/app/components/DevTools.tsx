/**
 * DevTools - Panneau de contrôle pour le développement
 * Permet de contrôler le délai API en temps réel
 */

import React, { useState } from 'react'
import { Settings, Zap, Clock } from 'lucide-react'
import { devConfig } from '@/app/config/devConfig'

export const DevTools: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [enabled, setEnabled] = useState(devConfig.enableApiDelay)
  const [delay, setDelay] = useState(devConfig.apiDelayMs)
  const [useRandom, setUseRandom] = useState(devConfig.useRandomDelay)

  // N'afficher qu'en développement
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const handleToggleEnable = () => {
    devConfig.enableApiDelay = !enabled
    setEnabled(!enabled)
    console.log(`🔧 Délai API ${!enabled ? 'activé' : 'désactivé'}`)
  }

  const handleDelayChange = (value: number) => {
    devConfig.apiDelayMs = value
    setDelay(value)
    console.log(`🔧 Délai API: ${value}ms`)
  }

  const handleRandomToggle = () => {
    devConfig.useRandomDelay = !useRandom
    setUseRandom(!useRandom)
    console.log(`🔧 Délai aléatoire ${!useRandom ? 'activé' : 'désactivé'}`)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2"
          title="Ouvrir DevTools"
        >
          <Settings className="h-5 w-5 animate-spin-slow" />
          {enabled && <Clock className="h-4 w-4" />}
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-4 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                DevTools
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          {/* API Delay Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Délai API
                </span>
              </div>
              <button
                onClick={handleToggleEnable}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Delay Slider */}
            {enabled && (
              <>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                    Délai: {delay}ms
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={delay}
                    onChange={(e) => handleDelayChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0ms</span>
                    <span>2.5s</span>
                    <span>5s</span>
                  </div>
                </div>

                {/* Random Delay Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Délai aléatoire
                  </span>
                  <button
                    onClick={handleRandomToggle}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      useRandom
                        ? 'bg-purple-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        useRandom ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Presets */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Presets rapides:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelayChange(500)}
                      className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      Subtil<br/>500ms
                    </button>
                    <button
                      onClick={() => handleDelayChange(1000)}
                      className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      Normal<br/>1s
                    </button>
                    <button
                      onClick={() => handleDelayChange(2000)}
                      className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      Long<br/>2s
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Simule un délai réseau pour tester les états de chargement
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

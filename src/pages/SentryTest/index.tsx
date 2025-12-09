import * as Sentry from '@sentry/react';
import { logger } from '@/shared/lib/logger';

export function SentryTestPage() {
  const testInfo = () => {
    logger.info('Test info log from Sentry test page', { 
      timestamp: new Date().toISOString(),
      action: 'test_info_button' 
    });
  };

  const testWarning = () => {
    logger.warn('Test warning log from Sentry', { 
      level: 'warning',
      action: 'test_warning_button'
    });
  };

  const testError = () => {
    logger.error('Test error log from Sentry', new Error('This is a test error!'), {
      action: 'test_error_button'
    });
  };

  const testException = () => {
    throw new Error('💥 This is your first Sentry error!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sentry Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Sentry Logging</h2>
            <p className="text-gray-600 mb-4">
              Ces boutons envoient des logs à Sentry en production uniquement.
              En développement, les logs apparaissent dans la console.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={testInfo}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              📘 Test Info Log
            </button>

            <button
              onClick={testWarning}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              ⚠️ Test Warning Log
            </button>

            <button
              onClick={testError}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              🔶 Test Error Log
            </button>

            <button
              onClick={testException}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              💥 Test Exception (Crash)
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-700">
              <strong>Mode actuel:</strong> {import.meta.env.MODE}
              <br />
              <strong>Production:</strong> {import.meta.env.PROD ? 'Oui' : 'Non'}
              <br />
              <strong>Sentry DSN:</strong> {import.meta.env.VITE_SENTRY_DSN ? 'Configuré ✅' : 'Non configuré ❌'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

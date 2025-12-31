import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  debugLanguageDataFlow,
  testOwnerUpdate,
  testCollaboratorUpdate,
} from '@/services/debugLanguageService';

/**
 * DEBUG PAGE FOR P1.4 DATA ISSUES
 * 
 * Navigate to: /debug/languages/:languageId
 * 
 * This page runs comprehensive diagnostic tests on:
 * 1. Data fetching (SELECT queries)
 * 2. Spec field population
 * 3. UPDATE permissions (owner & collaborator)
 * 4. RLS policy enforcement
 * 5. Data mapping
 */

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export const DebugLanguagePage = () => {
  const { languageId } = useParams<{ languageId: string }>();
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [debugOutput, setDebugOutput] = useState<string>('');

  if (!languageId) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-20">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error: No language ID provided</p>
        </div>
      </div>
    );
  }

  const runAllTests = async () => {
    setRunning(true);
    setResults([]);
    setDebugOutput('');

    // Capture console output
    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args: any[]) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    try {
      // Run comprehensive debug flow
      await debugLanguageDataFlow(languageId);

      // Run permission tests
      const ownerCanUpdate = await testOwnerUpdate(languageId);
      const collabCanUpdate = await testCollaboratorUpdate(languageId);

      setResults([
        { name: 'Data Flow Debug', passed: true, message: 'Comprehensive test completed - see console' },
        { name: 'Owner UPDATE Permission', passed: ownerCanUpdate, message: ownerCanUpdate ? 'Owner can update' : 'Owner cannot update' },
        {
          name: 'Collaborator UPDATE Permission',
          passed: collabCanUpdate,
          message: collabCanUpdate ? 'Collaborators can update' : 'Collaborators cannot update',
        },
      ]);

      setDebugOutput(logs.join('\n'));
    } catch (err) {
      console.error('Test error:', err);
      setResults([
        { name: 'Test Execution', passed: false, message: String(err) },
      ]);
      setDebugOutput(logs.join('\n'));
    } finally {
      console.log = originalLog;
      setRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔍 Language Debug Console
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Testing language ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{languageId}</code>
        </p>
      </div>

      {/* Run Tests Button */}
      <button
        onClick={runAllTests}
        disabled={running}
        className="mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {running ? '⏳ Running Tests...' : '▶️ Run All Tests'}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Results:</h2>
          {results.map((result, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border-2 ${
                result.passed
                  ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{result.passed ? '✅' : '❌'}</span>
                <div>
                  <p className={`font-semibold ${result.passed ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    {result.name}
                  </p>
                  <p className={`text-sm ${result.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {result.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Console Output */}
      {debugOutput && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Console Output:</h2>
          <div className="bg-gray-900 dark:bg-black text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto font-mono text-sm">
            <pre>{debugOutput}</pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-8">
        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">What This Tests:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>✓ Can fetch language data via RLS</li>
          <li>✓ Are all spec fields populated in database</li>
          <li>✓ Can owner UPDATE the language</li>
          <li>✓ Can collaborator UPDATE the language</li>
          <li>✓ Is data mapping function working</li>
        </ul>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-3 italic">
          Open browser console (F12) to see detailed debug logs.
        </p>
      </div>
    </div>
  );
};

export default DebugLanguagePage;

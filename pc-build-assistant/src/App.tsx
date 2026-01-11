/**
 * Main App Component
 * PC Build Assistant Application
 * Requirements: 1.5, 2.3, 10.1, 10.2
 */

import { useState, useEffect } from 'react';
import { PreferenceCollector } from './components/PreferenceCollector';
import { BuildWizard } from './components/BuildWizard';
import { BuildSummary } from './components/BuildSummary';
import { PersistenceWarning } from './components/PersistenceWarning';
import { useBuildStore } from './store/buildStore';
import { generateFinalSummary, BuildSummary as BuildSummaryType } from './services/aiExplainerWithErrorHandling';
import type { CompleteBuild } from './types/build';
import './App.css';

type AppView = 'preferences' | 'build-wizard' | 'summary';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('preferences');
  const { mode, build, metrics, persistenceError, clearPersistenceError } = useBuildStore();
  const [summaryData, setSummaryData] = useState<BuildSummaryType | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Check if build is complete - hoisted to be used in effects
  const isCompleteBuild = (build: any): build is CompleteBuild => {
    return (
      build.cpu !== undefined &&
      build.gpu !== undefined &&
      build.motherboard !== undefined &&
      build.ram !== undefined &&
      build.storage !== undefined &&
      build.storage.length > 0 &&
      build.psu !== undefined
    );
  };

  const handlePreferencesComplete = () => {
    // Navigate to build wizard after preferences are saved
    // Requirements: 1.5
    setCurrentView('build-wizard');
  };

  const handleBuildComplete = () => {
    // Navigate to final summary when all components are selected
    // Requirements: 2.3, 8.1
    setCurrentView('summary');
  };

  // Effect to generate summary when entering summary view
  useEffect(() => {
    if (currentView === 'summary' && isCompleteBuild(build)) {
      const fetchSummary = async () => {
        setIsSummaryLoading(true);
        try {
          const data = await generateFinalSummary(build);
          setSummaryData(data);
        } catch (e) {
          console.error("Failed to generate summary", e);
        } finally {
          setIsSummaryLoading(false);
        }
      };
      fetchSummary();
    }
  }, [currentView, build]);

  const handleStartNewBuild = () => {
    // Reset and start a new build
    useBuildStore.getState().resetBuild();
    setSummaryData(null);
    setCurrentView('preferences');
  };

  const handleGoHome = () => {
    setCurrentView('preferences');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app" data-theme={theme}>
      {/* Skip to main content for keyboard navigation */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {/* Persistence Warning - Requirements: 10.1, 10.2 */}
      {persistenceError && (
        <PersistenceWarning
          message={persistenceError}
          onDismiss={clearPersistenceError}
        />
      )}

      <header className="app-header" role="banner">
        <div className="header-content">
          <h1 onClick={handleGoHome} style={{ cursor: 'pointer' }} title="Go to home">
            PC Build Assistant
          </h1>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <p>Build your perfect PC with guided component selection</p>
      </header>

      <main id="main-content" className="app-main" role="main">
        {currentView === 'preferences' && (
          <div className="fade-in">
            <PreferenceCollector onComplete={handlePreferencesComplete} />
          </div>
        )}

        {currentView === 'build-wizard' && (
          <div className="fade-in">
            <BuildWizard
              mode={mode}
              onComplete={handleBuildComplete}
            />
          </div>
        )}

        {currentView === 'summary' && (
          <div className="fade-in">
            {isSummaryLoading ? (
              <div className="loading-state">
                <div className="loading-spinner large"></div>
                <h2>Finalizing your build...</h2>
                <p>AI is analyzing your configuration.</p>
              </div>
            ) : (
              isCompleteBuild(build) && metrics && summaryData ? (
                <BuildSummary
                  build={build}
                  summary={summaryData}
                  metrics={metrics}
                  mode={mode}
                  onStartNewBuild={handleStartNewBuild}
                />
              ) : (
                currentView === 'summary' && (
                  <div className="summary-view">
                    <h2>Build Incomplete</h2>
                    <p>Please complete all component selections before viewing the summary.</p>
                    <button onClick={() => setCurrentView('build-wizard')}>
                      Return to Build Wizard
                    </button>
                  </div>
                )
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

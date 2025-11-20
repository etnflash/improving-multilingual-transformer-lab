import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ConjugationTable from '../components/ConjugationTable'
import QuickCheck from '../components/QuickCheck'
import ExerciseAccordion from '../components/ExerciseAccordion'
import LanguageContext from '../context/LanguageContext'

function GrammarTopic() {
  const { languageCode, levelId, topicId } = useParams()
  const [status, setStatus] = useState({ message: 'Loading topic...', busy: true, error: false })
  const [topic, setTopic] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const { uiLanguage } = useContext(LanguageContext)

  useEffect(() => {
    async function loadTopic() {
      setStatus({ message: 'Loading topic...', busy: true, error: false })
      try {
        const response = await fetch(`/data/languages/${languageCode}/levels/${levelId}/grammar.json`)
        if (!response.ok) {
          throw new Error(`Failed to load grammar file (${response.status})`)
        }
        const payload = await response.json()
        const nextTopic = (payload.topics || []).find((entry) => entry.id === topicId)
        if (!nextTopic) {
          setStatus({ message: 'Topic not found in this level.', busy: false, error: true })
          setTopic(null)
          return
        }
        setTopic(nextTopic)
        setActiveTab('overview')
        setStatus({ message: 'Ready', busy: false, error: false })
      } catch (error) {
        console.error('Unable to load grammar topic', error)
        setStatus({ message: 'Unable to load grammar topic. Please try again.', busy: false, error: true })
      }
    }

    loadTopic()
  }, [languageCode, levelId, topicId])

  const translationOverlay = topic?.translations?.[uiLanguage] ?? null
  const showTranslation = Boolean(
    translationOverlay && uiLanguage && languageCode && uiLanguage !== languageCode
  )
  const pointsList = topic?.points
  const detailsList = topic?.details
  const examplesList = topic?.examples
  const practicePrompts = topic?.practice
  const interactionItems = topic?.interactions
  const visualVocabulary = topic?.visualVocabulary

  const tabs = useMemo(() => {
    const hasConjugations = Array.isArray(topic?.conjugations) && topic.conjugations.length > 0
    const hasPractice =
      (Array.isArray(practicePrompts) && practicePrompts.length > 0) ||
      (Array.isArray(interactionItems) && interactionItems.length > 0)
    const hasTips = Array.isArray(detailsList) && detailsList.length > 0

    return [
      { id: 'overview', label: 'Overview', enabled: Boolean(topic) },
      { id: 'conjugations', label: 'Conjugations', enabled: hasConjugations },
      { id: 'practice', label: 'Practice', enabled: hasPractice },
      { id: 'tips', label: 'Tips', enabled: hasTips },
    ]
  }, [topic, practicePrompts, interactionItems, detailsList])

  useEffect(() => {
    const currentTab = tabs.find((tab) => tab.id === activeTab)
    if (currentTab && currentTab.enabled) {
      return
    }
    const fallback = tabs.find((tab) => tab.enabled)
    if (fallback) {
      setActiveTab(fallback.id)
    }
  }, [tabs, activeTab])

  const practiceSections = useMemo(() => {
    if (!topic) {
      return []
    }

    const sections = []

    if (Array.isArray(practicePrompts) && practicePrompts.length > 0) {
      sections.push({
        id: 'prompts',
        title: 'Prompt deck',
        description: 'Use these guided prompts for quick writing or speaking drills.',
        content: (
          <ul className="topic-practice">
            {practicePrompts.map((prompt, index) => (
              <li key={index}>
                {prompt}
                {showTranslation && translationOverlay?.practice?.[index] && (
                  <p className="appendix-meta translation-note">
                    {translationOverlay.practice[index]}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ),
      })
    }

    if (Array.isArray(interactionItems) && interactionItems.length > 0) {
      sections.push({
        id: 'interactive',
        title: 'Quick checks',
        description: 'Answer the interactive exercises below and reveal hints when needed.',
        content: <QuickCheck items={interactionItems} />, 
      })
    }

    return sections
  }, [practicePrompts, interactionItems, showTranslation, translationOverlay])

  const renderOverview = () => (
    <div className="topic-tab-panel">
      <section className="topic-hero">
        <p className="topic-summary">{topic.summary}</p>
        {showTranslation && translationOverlay?.summary && (
          <p className="topic-summary translation-note">{translationOverlay.summary}</p>
        )}
        <div className="chip-row">
          <span className="chip">
            {languageCode?.toUpperCase()} · {levelId?.toUpperCase()}
          </span>
          <span className="chip chip-muted">Grammar</span>
        </div>
      </section>

      {visualVocabulary?.items?.length > 0 && (
        <section className="topic-visual-vocab">
          <div className="visual-vocab-header">
            <h3>{visualVocabulary.title || 'Key vocabulary'}</h3>
            {visualVocabulary.subtitle && (
              <p className="appendix-meta">{visualVocabulary.subtitle}</p>
            )}
          </div>
          <div className="visual-vocab-grid">
            {visualVocabulary.items.map((entry, index) => (
              <div key={`${entry.term}-${index}`} className="visual-vocab-chip">
                <div className="visual-vocab-term-row">
                  <span className="visual-vocab-term">{entry.term}</span>
                  {entry.note && <span className="visual-vocab-note">{entry.note}</span>}
                </div>
                {entry.translation && (
                  <p className="visual-vocab-translation">{entry.translation}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {Array.isArray(pointsList) && pointsList.length > 0 && (
        <div className="topic-section">
          <h3>Key points</h3>
          <ul>
            {pointsList.map((point, index) => (
              <li key={index}>
                {point}
                {showTranslation && translationOverlay?.points?.[index] && (
                  <p className="appendix-meta translation-note">
                    {translationOverlay.points[index]}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(examplesList) && examplesList.length > 0 && (
        <div className="topic-examples">
          <h3>Examples</h3>
          {examplesList.map((example, index) => (
            <article key={index}>
              <p>
                <strong>{example.sentence}</strong>
                <br />
                {example.translation}
              </p>
              {example.explanation && <p className="appendix-meta">{example.explanation}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  )

  const renderConjugations = () => (
    <div className="topic-tab-panel">
      <ConjugationTable conjugations={topic?.conjugations} />
    </div>
  )

  const renderPractice = () => (
    <div className="topic-tab-panel">
      {practiceSections.length > 0 ? (
        <ExerciseAccordion sections={practiceSections} />
      ) : (
        <p className="panel-status">No practice content for this topic yet.</p>
      )}
    </div>
  )

  const renderTips = () => (
    <div className="topic-tab-panel">
      {Array.isArray(detailsList) && detailsList.length > 0 ? (
        <div className="topic-section">
          <h3>Detailed explanation</h3>
          {detailsList.map((paragraph, index) => (
            <div key={index}>
              <p>{paragraph}</p>
              {showTranslation && translationOverlay?.details?.[index] && (
                <p className="appendix-meta translation-note">
                  {translationOverlay.details[index]}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="panel-status">No additional tips yet.</p>
      )}
    </div>
  )

  const tabPanels = {
    overview: renderOverview,
    conjugations: renderConjugations,
    practice: renderPractice,
    tips: renderTips,
  }

  return (
    <div className="grammar-topic-page">
      <header className="card topic-header">
        <div>
          <p className="breadcrumb">
            <Link to="/appendix">Appendix</Link>
            <span> / </span>
            <Link to={`/appendix?language=${languageCode}&level=${levelId}`}>
              {languageCode?.toUpperCase()} · {levelId}
            </Link>
            <span> / </span>
            <span>Grammar</span>
          </p>
          <h1>{topic ? topic.title : 'Grammar topic'}</h1>
          <p className={`panel-status ${status.error ? 'is-error' : ''}`}>{status.message}</p>
        </div>
        <Link className="button" to={`/appendix?language=${languageCode}&level=${levelId}`}>
          Back to Appendix
        </Link>
      </header>

      {topic && (
        <>
          <nav className="topic-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tab-button ${activeTab === tab.id ? 'is-active' : ''}`}
                disabled={!tab.enabled}
                onClick={() => tab.enabled && setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <section className="card topic-body" role="tabpanel">
            {tabPanels[activeTab]?.()}
          </section>
        </>
      )}
    </div>
  )
}

export default GrammarTopic

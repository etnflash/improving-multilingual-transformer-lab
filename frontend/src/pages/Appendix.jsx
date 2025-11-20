import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const PANEL_KEYS = ['grammar', 'vocabulary', 'conversation', 'patterns']
const PANEL_TITLES = {
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  conversation: 'Conversation',
  patterns: 'Patterns'
}

const defaultPanelStatus = PANEL_KEYS.reduce((acc, key) => {
  acc[key] = { message: 'Select a language and level.', busy: false, error: false }
  return acc
}, {})

function Appendix() {
  const [manifest, setManifest] = useState(null)
  const [manifestStatus, setManifestStatus] = useState({ message: 'Loading language manifest...', busy: true, error: false })
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [panelStatus, setPanelStatus] = useState(defaultPanelStatus)
  const [bundle, setBundle] = useState({})
  const [expandedGrammarId, setExpandedGrammarId] = useState(null)
  const [expandedVocabularyId, setExpandedVocabularyId] = useState(null)
  const cacheRef = useRef(new Map())
  const [searchParams, setSearchParams] = useSearchParams()
  const updateSearchParams = useCallback((updates) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      })
      return next
    })
  }, [setSearchParams])

  useEffect(() => {
    async function loadManifest() {
      try {
        setManifestStatus({ message: 'Loading language manifest...', busy: true, error: false })
        const response = await fetch('data/languages/manifest.json')
        if (!response.ok) {
          throw new Error(`Manifest request failed with status ${response.status}`)
        }
        const payload = await response.json()
        setManifest(payload)
        const requestedLanguage = searchParams.get('language')
        const initialCode = resolveInitialLanguage(payload, requestedLanguage)
        if (initialCode) {
          setSelectedLanguage(initialCode)
          updateSearchParams({ language: initialCode })
        }
        setManifestStatus({ message: 'Manifest ready.', busy: false, error: false })
      } catch (error) {
        console.error('Unable to load manifest', error)
        setManifestStatus({ message: 'Unable to load language manifest. Refresh to try again.', busy: false, error: true })
      }
    }
    loadManifest()
  }, [])

  useEffect(() => {
    if (!manifest || !selectedLanguage) {
      setSelectedLevel('')
      return
    }
    const meta = manifest.languages?.find((lang) => lang.code === selectedLanguage)
    const defaultLevel = meta?.levels?.[0]?.id || ''
    const requestedLevel = searchParams.get('level')
    const nextLevel = meta?.levels?.some((level) => level.id === requestedLevel) ? requestedLevel : defaultLevel
    if (nextLevel && nextLevel !== selectedLevel) {
      setSelectedLevel(nextLevel)
    }
    if (nextLevel && searchParams.get('level') !== nextLevel) {
      updateSearchParams({ language: selectedLanguage, level: nextLevel })
    }
  }, [manifest, selectedLanguage, selectedLevel, searchParams, updateSearchParams])

  useEffect(() => {
    if (selectedLanguage && selectedLevel) {
      loadAppendixBundle(selectedLanguage, selectedLevel)
    }
    setExpandedGrammarId(null)
    setExpandedVocabularyId(null)
  }, [selectedLanguage, selectedLevel])

  const handleGrammarToggle = useCallback((topicId) => {
    if (!topicId) {
      return
    }
    setExpandedGrammarId((current) => (current === topicId ? null : topicId))
  }, [])

  const handleVocabularyToggle = useCallback((setId) => {
    if (!setId) {
      return
    }
    setExpandedVocabularyId((current) => (current === setId ? null : setId))
  }, [])

  function handleLanguageChange(code) {
    setSelectedLanguage(code)
    setSelectedLevel('')
    updateSearchParams({ language: code, level: null })
  }

  function handleLevelChange(level) {
    setSelectedLevel(level)
    updateSearchParams({ language: selectedLanguage, level })
  }

  const languageOptions = manifest?.languages ?? []
  const levelOptions = useMemo(() => {
    if (!manifest || !selectedLanguage) {
      return []
    }
    const meta = manifest.languages.find((lang) => lang.code === selectedLanguage)
    return meta?.levels ?? []
  }, [manifest, selectedLanguage])

  async function loadAppendixBundle(langCode, level) {
    const cacheKey = `${langCode}-${level}`
    setPanelStatus((prev) => {
      const next = { ...prev }
      PANEL_KEYS.forEach((key) => {
        next[key] = { message: `Loading ${PANEL_TITLES[key]} content...`, busy: true, error: false }
      })
      return next
    })
    setBundle({})

    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)
      setBundle(cached)
      announcePanelCounts(cached)
      return
    }

    try {
      const basePath = `data/languages/${langCode}/levels/${level}`
      const [grammar, vocabulary, conversation, patterns] = await Promise.all([
        fetchJSON(`${basePath}/grammar.json`),
        fetchJSON(`${basePath}/vocabulary.json`),
        fetchJSON(`${basePath}/conversation.json`),
        fetchOptionalJSON(`${basePath}/patterns.json`)
      ])
      const payload = { grammar, vocabulary, conversation, patterns }
      cacheRef.current.set(cacheKey, payload)
      setBundle(payload)
      announcePanelCounts(payload)
    } catch (error) {
      console.error('Failed to load appendix bundle', error)
      setPanelStatus(
        PANEL_KEYS.reduce((acc, key) => {
          acc[key] = { message: 'Unable to load appendix data. Please try again.', busy: false, error: true }
          return acc
        }, {})
      )
    }
  }

  function announcePanelCounts(data) {
    setPanelStatus({
      grammar: describeCollection(data.grammar?.topics, 'grammar topic'),
      vocabulary: describeCollection(data.vocabulary?.sets, 'vocabulary set'),
      conversation: describeCollection(data.conversation?.scenes, 'scene'),
      patterns: describeCollection(data.patterns?.patterns, 'pattern', 'No patterns provided for this level.')
    })
  }

  return (
    <div className="appendix-page">
      <section className="card appendix-intro">
        <h1>Appendix</h1>
        <p>
          Browse CEFR-aligned grammar, vocabulary, and mini dialogues for each language. Choose a language and level to load
          structured JSON content directly—no code changes required as you expand the catalog.
        </p>
        <p className={`appendix-status ${manifestStatus.error ? 'is-error' : ''}`}>
          {manifestStatus.message}
        </p>
      </section>

      <section className="card appendix-controls">
        <div>
          <label htmlFor="appendix-language">Language</label>
          <select
            id="appendix-language"
            value={selectedLanguage}
            onChange={(event) => handleLanguageChange(event.target.value)}
            disabled={!languageOptions.length || manifestStatus.busy}
          >
            <option value="" disabled>
              {manifestStatus.busy ? 'Loading languages...' : 'Select language'}
            </option>
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="appendix-level">CEFR Level</label>
          <select
            id="appendix-level"
            value={selectedLevel}
            onChange={(event) => handleLevelChange(event.target.value)}
            disabled={!levelOptions.length}
          >
            {levelOptions.length === 0 && <option value="">No levels</option>}
            {levelOptions.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label || level.id}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="appendix-panels">
        {PANEL_KEYS.map((panelKey) => (
          <AppendixPanel key={panelKey} title={PANEL_TITLES[panelKey]} status={panelStatus[panelKey]}>
            {renderPanel(panelKey, bundle[panelKey], {
              selectedLanguage,
              selectedLevel,
              expandedGrammarId,
              expandedVocabularyId,
              onGrammarToggle: handleGrammarToggle,
              onVocabularyToggle: handleVocabularyToggle
            })}
          </AppendixPanel>
        ))}
      </div>
    </div>
  )
}

function renderPanel(panelKey, payload, context = {}) {
  if (!payload) {
    return null
  }

  if (panelKey === 'grammar') {
    const topics = payload.topics ?? []
    const { expandedGrammarId, onGrammarToggle, selectedLanguage, selectedLevel } = context
    return (
      <ul className="appendix-list">
        {topics.map((topic, index) => {
          const topicKey = topic.id || topic.title || `grammar-${index}`
          const isExpanded = expandedGrammarId === topicKey
          const handleToggle = () => {
            onGrammarToggle?.(topicKey)
          }
          const detailUrl = selectedLanguage && selectedLevel && topic.id
            ? `/appendix/${selectedLanguage}/${selectedLevel}/grammar/${topic.id}`
            : null
          return (
            <li key={topicKey}>
              <button type="button" className={`appendix-toggle ${isExpanded ? 'is-open' : ''}`} onClick={handleToggle}>
                <span className="appendix-list-title">{topic.title}</span>
                <span className="appendix-toggle-icon" aria-hidden="true">{isExpanded ? '−' : '+'}</span>
              </button>
              {isExpanded && (
                <div className="appendix-collapse">
                  {topic.summary && <p className="appendix-list-summary">{topic.summary}</p>}
                  {Array.isArray(topic.points) && topic.points.length > 0 && (
                    <ul>
                      {topic.points.map((point, pointIndex) => (
                        <li key={pointIndex}>{point}</li>
                      ))}
                    </ul>
                  )}
                  {Array.isArray(topic.examples) && topic.examples.length > 0 && (
                    <div className="appendix-examples">
                      <p className="appendix-meta">Examples</p>
                      {topic.examples.map((example, exampleIndex) => (
                        <p key={exampleIndex}>
                          <strong>{example.sentence}</strong>
                          <br />
                          {example.translation}
                          {example.explanation && (
                            <>
                              <br />
                              <span className="appendix-meta">{example.explanation}</span>
                            </>
                          )}
                        </p>
                      ))}
                    </div>
                  )}
                  {detailUrl && (
                    <div className="appendix-link-row">
                      <Link className="appendix-detail-link" to={detailUrl}>
                        Open full topic →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  if (panelKey === 'vocabulary') {
    const sets = payload.sets ?? []
    const { expandedVocabularyId, onVocabularyToggle, selectedLanguage, selectedLevel } = context
    return (
      <ul className="appendix-list">
        {sets.map((set, index) => {
          const setKey = set.id || set.title || `vocabulary-${index}`
          const isExpanded = expandedVocabularyId === setKey
          const handleToggle = () => {
            onVocabularyToggle?.(setKey)
          }
          const detailUrl = selectedLanguage && selectedLevel && set.id
            ? `/appendix/${selectedLanguage}/${selectedLevel}/vocabulary/${set.id}`
            : null
          return (
            <li key={setKey}>
              <button type="button" className={`appendix-toggle ${isExpanded ? 'is-open' : ''}`} onClick={handleToggle}>
                <span className="appendix-list-title">{set.title}</span>
                <span className="appendix-toggle-icon" aria-hidden="true">{isExpanded ? '−' : '+'}</span>
              </button>
              {isExpanded && (
                <div className="appendix-collapse">
                  {set.summary && <p className="appendix-list-summary">{set.summary}</p>}
                  <ul>
                    {(set.words || []).map((entry, wordIndex) => (
                      <li key={`${entry.term}-${wordIndex}`}>
                        <strong>{entry.term}</strong> — {entry.translation}
                        {entry.note && <span className="appendix-meta"> ({entry.note})</span>}
                      </li>
                    ))}
                  </ul>
                  {detailUrl && (
                    <div className="appendix-link-row">
                      <Link className="appendix-detail-link" to={detailUrl}>
                        Open full list →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  if (panelKey === 'conversation') {
    const scenes = payload.scenes ?? []
    return scenes.map((scene) => (
      <div key={scene.id || scene.title} className="appendix-card">
        <h4>{scene.title}</h4>
        <p>{scene.goal}</p>
        {(scene.dialog || []).map((turn, index) => (
          <p key={index}>
            <strong>{capitalize(turn.speaker)}:</strong> {turn.line}
            {turn.translation && (
              <>
                <br />
                <span className="appendix-meta">{turn.translation}</span>
              </>
            )}
          </p>
        ))}
      </div>
    ))
  }

  if (panelKey === 'patterns') {
    const patterns = payload.patterns ?? []
    return patterns.map((pattern) => (
      <div key={pattern.id || pattern.title} className="appendix-card">
        <h4>{pattern.title}</h4>
        {pattern.structure && <p className="appendix-meta">{pattern.structure}</p>}
        {(pattern.examples || []).map((example, index) => (
          <p key={index}>
            <strong>{example.sentence}</strong>
            <br />
            {example.translation}
          </p>
        ))}
        {Array.isArray(pattern.tips) && pattern.tips.length > 0 && (
          <ul>
            {pattern.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        )}
      </div>
    ))
  }

  return null
}

function AppendixPanel({ title, status, children }) {
  return (
    <article className="appendix-panel card">
      <header>
        <div className="panel-heading">
          <h3>{title}</h3>
          {status?.busy && <span className="panel-tag">Loading</span>}
        </div>
        <p className={`panel-status ${status?.error ? 'is-error' : ''}`}>{status?.message}</p>
      </header>
      <div className="appendix-panel-body">{children}</div>
    </article>
  )
}

function describeCollection(collection = [], label, emptyMessage = `No ${label}s yet.`) {
  if (!collection || collection.length === 0) {
    return { message: emptyMessage, busy: false, error: false }
  }
  const plural = collection.length === 1 ? label : `${label}s`
  return { message: `Loaded ${collection.length} ${plural}.`, busy: false, error: false }
}

async function fetchJSON(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request for ${url} failed with status ${response.status}`)
  }
  return response.json()
}

async function fetchOptionalJSON(url) {
  try {
    return await fetchJSON(url)
  } catch (error) {
    return null
  }
}

function resolveInitialLanguage(manifest, requestedCode) {
  if (!manifest?.languages) {
    return ''
  }
  if (requestedCode && manifest.languages.some((lang) => lang.code === requestedCode)) {
    return requestedCode
  }
  if (manifest.defaultLanguage) {
    return manifest.defaultLanguage
  }
  const firstLive = manifest.languages.find((lang) => !lang.status || lang.status === 'live')
  return firstLive ? firstLive.code : ''
}

function capitalize(value = '') {
  if (!value) {
    return ''
  }
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default Appendix

import React, { useEffect, useMemo, useState } from 'react'

const emptyMessage = 'No conjugations available for this topic yet.'

function ConjugationTable({ conjugations }) {
  const safeConjugations = Array.isArray(conjugations) ? conjugations : []
  const [activeIndex, setActiveIndex] = useState(0)
  const [highlightIrregular, setHighlightIrregular] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState('')

  useEffect(() => {
    if (!safeConjugations.length) {
      setActiveIndex(0)
      return
    }
    if (activeIndex > safeConjugations.length - 1) {
      setActiveIndex(0)
    }
  }, [safeConjugations.length, activeIndex])

  const activeConjugation = safeConjugations[activeIndex]

  useEffect(() => {
    if (!copyFeedback) {
      return
    }
    const timeout = setTimeout(() => setCopyFeedback(''), 1800)
    return () => clearTimeout(timeout)
  }, [copyFeedback])

  const irregularMap = useMemo(() => {
    return safeConjugations.reduce((acc, entry, idx) => {
      const flag = Boolean(entry?.note?.toLowerCase().includes('irregular') || entry?.tense?.toLowerCase().includes('irregular'))
      acc[idx] = flag
      return acc
    }, {})
  }, [safeConjugations])

  const handleCopy = async () => {
    if (!activeConjugation) {
      return
    }
    const header = `${activeConjugation.verb || 'Verbo'} — ${activeConjugation.tense || 'Tiempo'}`
    const rows = (activeConjugation.forms || [])
      .map((item) => `${item.person || ''}: ${item.form || ''}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(`${header}\n${rows}`)
      setCopyFeedback('Copied!')
    } catch (error) {
      console.error('Unable to copy conjugation table', error)
      setCopyFeedback('Copy failed')
    }
  }

  if (!safeConjugations.length) {
    return <p className="panel-status">{emptyMessage}</p>
  }

  return (
    <div className="conjugation-panel">
      <div className="conjugation-toolbar">
        <div className="verb-chip-list" role="tablist">
          {safeConjugations.map((entry, index) => (
            <button
              key={`${entry.verb}-${index}`}
              type="button"
              className={`verb-chip ${index === activeIndex ? 'is-active' : ''}`}
              onClick={() => setActiveIndex(index)}
              role="tab"
              aria-selected={index === activeIndex}
            >
              <span>{entry.verb || `Verb ${index + 1}`}</span>
              {entry.tense && <small>{entry.tense}</small>}
              {irregularMap[index] && <span className="chip-badge">Irregular</span>}
            </button>
          ))}
        </div>
        <div className="conjugation-actions">
          <label className="toggle">
            <input
              type="checkbox"
              checked={highlightIrregular}
              onChange={() => setHighlightIrregular((value) => !value)}
            />
            <span>Highlight irregular verbs</span>
          </label>
          <button type="button" className="button button-secondary" onClick={handleCopy}>
            Copy table
          </button>
          {copyFeedback && <span className="copy-feedback">{copyFeedback}</span>}
        </div>
      </div>

      {activeConjugation && (
        <div className={`conjugation-card ${highlightIrregular && irregularMap[activeIndex] ? 'is-irregular' : ''}`}>
          <header>
            <h4>{activeConjugation.verb}</h4>
            <p>{activeConjugation.note || activeConjugation.tense}</p>
          </header>
          <div className="conjugation-table" role="table">
            <div className="conjugation-row is-head" role="row">
              <span role="columnheader">Pronoun</span>
              <span role="columnheader">Form</span>
            </div>
            {(activeConjugation.forms || []).map((form, index) => (
              <div className="conjugation-row" role="row" key={`${form.person}-${form.form}-${index}`}>
                <span role="cell">{form.person}</span>
                <span role="cell" className="conjugation-form">{form.form}</span>
              </div>
            ))}
          </div>
          {Array.isArray(activeConjugation.usageScenarios) && activeConjugation.usageScenarios.length > 0 && (
            <div className="usage-scenarios">
              <p className="chip-label">Usage ideas</p>
              <ul>
                {activeConjugation.usageScenarios.map((scenario, index) => (
                  <li key={index}>{scenario}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ConjugationTable

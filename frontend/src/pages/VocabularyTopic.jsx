import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function VocabularyTopic() {
  const { languageCode, levelId, setId } = useParams()
  const [status, setStatus] = useState({ message: 'Loading vocabulary set...', busy: true, error: false })
  const [vocabSet, setVocabSet] = useState(null)

  useEffect(() => {
    async function loadSet() {
      setStatus({ message: 'Loading vocabulary set...', busy: true, error: false })
      try {
        const response = await fetch(`/data/languages/${languageCode}/levels/${levelId}/vocabulary.json`)
        if (!response.ok) {
          throw new Error(`Failed to load vocabulary file (${response.status})`)
        }
        const payload = await response.json()
        const nextSet = (payload.sets || []).find((entry) => entry.id === setId)
        if (!nextSet) {
          setStatus({ message: 'Vocabulary set not found in this level.', busy: false, error: true })
          setVocabSet(null)
          return
        }
        setVocabSet(nextSet)
        setStatus({ message: 'Ready', busy: false, error: false })
      } catch (error) {
        console.error('Unable to load vocabulary set', error)
        setStatus({ message: 'Unable to load vocabulary set. Please try again.', busy: false, error: true })
      }
    }

    loadSet()
  }, [languageCode, levelId, setId])

  return (
    <div className="vocabulary-topic-page">
      <header className="card topic-header">
        <div>
          <p className="breadcrumb">
            <Link to="/appendix">Appendix</Link>
            <span> / </span>
            <Link to={`/appendix?language=${languageCode}&level=${levelId}`}>{languageCode?.toUpperCase()} · {levelId}</Link>
            <span> / </span>
            <span>Vocabulary</span>
          </p>
          <h1>{vocabSet ? vocabSet.title : 'Vocabulary set'}</h1>
          <p className={`panel-status ${status.error ? 'is-error' : ''}`}>{status.message}</p>
        </div>
        <Link className="button" to={`/appendix?language=${languageCode}&level=${levelId}`}>
          Back to Appendix
        </Link>
      </header>

      {vocabSet && (
        <section className="card topic-body">
          {vocabSet.summary && <p>{vocabSet.summary}</p>}
          {Array.isArray(vocabSet.words) && vocabSet.words.length > 0 && (
            <div>
              <h3>Word list</h3>
              <ul className="vocabulary-words">
                {vocabSet.words.map((entry, index) => (
                  <li key={`${entry.term}-${index}`}>
                    <div className="word-term">
                      <strong>{entry.term}</strong>
                      {entry.pronunciation && <span className="appendix-meta"> {entry.pronunciation}</span>}
                    </div>
                    <div className="word-translation">
                      {entry.translation}
                      {entry.note && <span className="appendix-meta"> · {entry.note}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default VocabularyTopic

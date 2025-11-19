import React, { useState } from 'react'
import axios from 'axios'

function SentenceCorrection({ language }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCorrect = async () => {
    if (!text.trim()) return

    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.post('/api/correct', {
        text,
        language: language.code
      })
      setResult(response.data)
    } catch (err) {
      setError('Failed to correct sentence. Make sure the backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card">
        <h1>✏️ Sentence Correction - {language.name}</h1>
        <p>Enter a sentence to get correction suggestions and improve your writing.</p>
      </div>

      <div className="card">
        <div className="input-group">
          <label htmlFor="sentence">Enter your sentence:</label>
          <textarea
            id="sentence"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a sentence here..."
            rows="4"
          />
        </div>

        <button 
          className="button" 
          onClick={handleCorrect}
          disabled={loading || !text.trim()}
        >
          {loading ? 'Analyzing...' : 'Check Sentence'}
        </button>

        {error && (
          <div className="error" style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: '2rem' }}>
            <h3>Original:</h3>
            <div className="example-item">{result.original}</div>

            {result.suggestions && result.suggestions.length > 0 && (
              <>
                <h3 style={{ marginTop: '1.5rem' }}>Suggestions:</h3>
                <ul className="example-list">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="example-item">
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                        {suggestion.type}
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>{suggestion.message}</div>
                      <div style={{ color: '#27ae60', fontWeight: '500' }}>
                        → {suggestion.suggestion}
                      </div>
                    </li>
                  ))}
                </ul>

                <h3 style={{ marginTop: '1.5rem' }}>Corrected:</h3>
                <div className="example-item" style={{ borderLeftColor: '#27ae60' }}>
                  {result.corrected}
                </div>
              </>
            )}

            {(!result.suggestions || result.suggestions.length === 0) && (
              <div className="success" style={{ marginTop: '1rem' }}>
                ✓ No corrections needed! Your sentence looks good.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SentenceCorrection

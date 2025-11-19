import React, { useState } from 'react'

function PatternLearning({ language }) {
  const [selectedPattern, setSelectedPattern] = useState(null)
  const [answers, setAnswers] = useState({})
  const [showAnswers, setShowAnswers] = useState(false)

  if (!language || !language.patterns) {
    return <div className="card">No patterns available for this language.</div>
  }

  const handlePatternSelect = (pattern) => {
    setSelectedPattern(pattern)
    setAnswers({})
    setShowAnswers(false)
  }

  const handleAnswerChange = (index, value) => {
    setAnswers({ ...answers, [index]: value })
  }

  const checkAnswers = () => {
    setShowAnswers(true)
  }

  return (
    <div>
      <div className="card">
        <h1>📚 Pattern Learning - {language.name}</h1>
        <p>Select a pattern to learn and practice.</p>
      </div>

      <div className="grid">
        {language.patterns.map((pattern, index) => (
          <div 
            key={pattern.id} 
            className="card" 
            style={{ cursor: 'pointer', border: selectedPattern?.id === pattern.id ? '2px solid #3498db' : 'none' }}
            onClick={() => handlePatternSelect(pattern)}
          >
            <h3>{pattern.title}</h3>
            <p>{pattern.explanation}</p>
          </div>
        ))}
      </div>

      {selectedPattern && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>{selectedPattern.title}</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{selectedPattern.explanation}</p>

          <h3>Examples:</h3>
          <ul className="example-list">
            {selectedPattern.examples.map((example, index) => (
              <li key={index} className="example-item">
                <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{example.sentence}</div>
                <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>{example.translation}</div>
              </li>
            ))}
          </ul>

          <h3 style={{ marginTop: '2rem' }}>Practice:</h3>
          {selectedPattern.practice.map((question, index) => (
            <div key={index} className="practice-question">
              <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>{question.prompt}</p>
              <input
                type="text"
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="Your answer..."
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              />
              {showAnswers && (
                <div className={`practice-answer ${answers[index]?.toLowerCase() === question.answer.toLowerCase() ? 'success' : 'error'}`}>
                  {answers[index]?.toLowerCase() === question.answer.toLowerCase() 
                    ? '✓ Correct!' 
                    : `✗ The correct answer is: ${question.answer}`}
                </div>
              )}
            </div>
          ))}

          <button className="button" onClick={checkAnswers} style={{ marginTop: '1rem' }}>
            Check Answers
          </button>
        </div>
      )}
    </div>
  )
}

export default PatternLearning

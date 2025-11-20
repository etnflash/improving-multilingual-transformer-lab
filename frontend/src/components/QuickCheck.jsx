import React from 'react'

function normalize(value = '') {
  return value.trim().toLowerCase()
}

function QuickCheck({ items = [] }) {
  if (!items.length) {
    return <p className="panel-status">No interactive checks configured yet.</p>
  }

  return (
    <div className="quick-check-stack">
      {items.map((item, index) => (
        <QuickCheckCard item={item} key={`${item.prompt}-${index}`} number={index + 1} />
      ))}
    </div>
  )
}

function QuickCheckCard({ item, number }) {
  const [userInput, setUserInput] = React.useState('')
  const [selectedOption, setSelectedOption] = React.useState('')
  const [status, setStatus] = React.useState('idle')
  const [showHint, setShowHint] = React.useState(false)

  const answer = Array.isArray(item.answer) ? item.answer.map(normalize) : [normalize(item.answer)]

  const handleSubmit = (event) => {
    event.preventDefault()
    if (item.type === 'multiple-choice') {
      const isCorrect = answer.includes(normalize(selectedOption))
      setStatus(isCorrect ? 'correct' : 'incorrect')
      return
    }
    const isCorrect = answer.includes(normalize(userInput))
    setStatus(isCorrect ? 'correct' : 'incorrect')
  }

  const handleReveal = () => setStatus('revealed')

  const renderInput = () => {
    if (item.type === 'multiple-choice') {
      return (
        <div className="quick-choice-list">
          {(item.options || []).map((option) => (
            <label key={option} className={`choice ${selectedOption === option ? 'is-selected' : ''}`}>
              <input
                type="radio"
                name={`qc-${number}`}
                value={option}
                checked={selectedOption === option}
                onChange={(event) => {
                  setSelectedOption(event.target.value)
                  setStatus('idle')
                }}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )
    }

    return (
      <input
        className="quick-input"
        type="text"
        value={userInput}
        placeholder="Type your answer"
        onChange={(event) => {
          setUserInput(event.target.value)
          setStatus('idle')
        }}
      />
    )
  }

  const statusLabel = {
    idle: 'Awaiting answer',
    correct: 'Great! Correct answer.',
    incorrect: 'Try again.',
    revealed: `Answer: ${Array.isArray(item.answer) ? item.answer.join(', ') : item.answer}`,
  }[status]

  return (
    <form className="quick-check-card" onSubmit={handleSubmit}>
      <div className="quick-card-head">
        <span className="badge">Exercise {number}</span>
        {item.type && <span className="badge badge-muted">{item.type.replace('-', ' ')}</span>}
      </div>
      <p className="quick-prompt">{item.prompt}</p>
      {renderInput()}
      <div className="quick-actions">
        {item.hint && (
          <button type="button" className="link-button" onClick={() => setShowHint((value) => !value)}>
            {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        )}
        <div className="quick-buttons">
          <button type="button" className="button button-secondary" onClick={handleReveal}>
            Show answer
          </button>
          <button type="submit" className="button">
            Check answer
          </button>
        </div>
      </div>
      {showHint && <p className="quick-hint">Hint: {item.hint}</p>}
      {status !== 'idle' && <p className={`quick-status quick-status-${status}`}>{statusLabel}</p>}
      {item.explanation && <p className="quick-explanation">{item.explanation}</p>}
    </form>
  )
}

export default QuickCheck

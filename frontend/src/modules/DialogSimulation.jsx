import React, { useState } from 'react'

function DialogSimulation({ language }) {
  const [selectedDialog, setSelectedDialog] = useState(null)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showPractice, setShowPractice] = useState(false)

  if (!language || !language.dialogs) {
    return <div className="card">No dialogs available for this language.</div>
  }

  const handleDialogSelect = (dialog) => {
    setSelectedDialog(dialog)
    setCurrentMessageIndex(0)
    setShowPractice(false)
    setUserAnswer('')
  }

  const handleNext = () => {
    if (currentMessageIndex < selectedDialog.conversation.length - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1)
    } else {
      setShowPractice(true)
    }
  }

  const handlePrevious = () => {
    if (currentMessageIndex > 0) {
      setCurrentMessageIndex(currentMessageIndex - 1)
    }
  }

  const handleRestart = () => {
    setCurrentMessageIndex(0)
    setShowPractice(false)
    setUserAnswer('')
  }

  return (
    <div>
      <div className="card">
        <h1>💬 Dialog Simulation - {language.name}</h1>
        <p>Practice real-world conversations through interactive scenarios.</p>
      </div>

      <div className="grid">
        {language.dialogs.map((dialog) => (
          <div 
            key={dialog.id} 
            className="card" 
            style={{ cursor: 'pointer', border: selectedDialog?.id === dialog.id ? '2px solid #3498db' : 'none' }}
            onClick={() => handleDialogSelect(dialog)}
          >
            <h3>{dialog.title}</h3>
            <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>{dialog.scenario}</p>
          </div>
        ))}
      </div>

      {selectedDialog && !showPractice && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>{selectedDialog.title}</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>{selectedDialog.scenario}</p>

          <div style={{ minHeight: '200px' }}>
            {selectedDialog.conversation.slice(0, currentMessageIndex + 1).map((message, index) => (
              <div 
                key={index}
                className={`dialog-message ${index % 2 === 0 ? 'speaker-a' : 'speaker-b'}`}
              >
                <div className="speaker">{message.speaker}</div>
                <div>{message.text}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              className="button button-secondary" 
              onClick={handlePrevious}
              disabled={currentMessageIndex === 0}
            >
              Previous
            </button>
            <button 
              className="button" 
              onClick={handleNext}
            >
              {currentMessageIndex < selectedDialog.conversation.length - 1 ? 'Next' : 'Practice'}
            </button>
            <button 
              className="button button-secondary" 
              onClick={handleRestart}
            >
              Restart
            </button>
          </div>

          <div style={{ marginTop: '1rem', color: '#7f8c8d' }}>
            Message {currentMessageIndex + 1} of {selectedDialog.conversation.length}
          </div>
        </div>
      )}

      {showPractice && selectedDialog && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>Practice Questions</h2>
          {selectedDialog.practice.map((question, index) => (
            <div key={index} className="practice-question">
              <p style={{ fontWeight: '500', marginBottom: '0.75rem' }}>{question.prompt}</p>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer..."
                rows="3"
                style={{ width: '100%', padding: '0.5rem' }}
              />
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <strong>Possible answers:</strong>
                <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                  {question.answers.map((answer, idx) => (
                    <li key={idx}>{answer}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          <button 
            className="button button-secondary" 
            onClick={handleRestart}
            style={{ marginTop: '1rem' }}
          >
            Back to Dialog
          </button>
        </div>
      )}
    </div>
  )
}

export default DialogSimulation

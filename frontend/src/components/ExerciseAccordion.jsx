import React, { useState } from 'react'

function ExerciseAccordion({ sections = [] }) {
  if (!sections.length) {
    return null
  }

  const [openId, setOpenId] = useState(sections[0]?.id)

  return (
    <div className="exercise-accordion">
      {sections.map((section) => {
        const isOpen = openId === section.id
        return (
          <article className={`exercise-panel ${isOpen ? 'is-open' : ''}`} key={section.id}>
            <button
              type="button"
              className="exercise-toggle"
              onClick={() => setOpenId(isOpen ? null : section.id)}
            >
              <div>
                <h4>{section.title}</h4>
                {section.description && <p>{section.description}</p>}
              </div>
              <span className="exercise-icon">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <div className="exercise-content">{section.content}</div>}
          </article>
        )
      })}
    </div>
  )
}

export default ExerciseAccordion

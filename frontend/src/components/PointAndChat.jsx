import React from 'react'

// Displays bilingual point-and-chat cue cards for demonstratives
function PointAndChat({ data }) {
  const { title, subtitle, cards = [] } = data || {}

  if (!cards.length) {
    return null
  }

  return (
    <section className="topic-widget point-chat">
      <header className="topic-widget-head">
        <div>
          <h3>{title || 'Point & chat'}</h3>
          {subtitle && <p className="appendix-meta">{subtitle}</p>}
        </div>
      </header>
      <div className="point-chat-grid">
        {cards.map((card, index) => (
          <article key={`${card.label}-${index}`} className="point-chat-card">
            <div className="point-chat-label">{card.label}</div>
            <p className="point-chat-spanish">{card.spanish}</p>
            <p className="point-chat-english">{card.english}</p>
            {(card.gesture || card.tip) && (
              <div className="point-chat-meta">
                {card.gesture && <span className="badge">{card.gesture}</span>}
                {card.tip && <p>{card.tip}</p>}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export default PointAndChat

import React from 'react'

// Displays point-and-chat cue cards with optional translations driven by UI language
function PointAndChat({ data, translations, showTranslation }) {
  const { title, subtitle, cards = [] } = data || {}
  const overlay = translations || {}

  if (!cards.length) {
    return null
  }

  const fallbackCardTranslation = (card) => {
    if (!card) {
      return null
    }

    if (typeof card.english === 'string') {
      return { sentence: card.english }
    }

    if (card.translation && typeof card.translation === 'object') {
      return card.translation
    }

    return null
  }

  return (
    <section className="topic-widget point-chat">
      <header className="topic-widget-head">
        <div>
          <h3>{title || 'Point & chat'}</h3>
          {subtitle && <p className="appendix-meta">{subtitle}</p>}
          {showTranslation && overlay.title && (
            <p className="appendix-meta translation-note">{overlay.title}</p>
          )}
          {showTranslation && overlay.subtitle && (
            <p className="appendix-meta translation-note">{overlay.subtitle}</p>
          )}
        </div>
      </header>
      <div className="point-chat-grid">
        {cards.map((card, index) => {
          const translationCard = overlay.cards?.[index] || fallbackCardTranslation(card)

          return (
            <article key={`${card.label}-${index}`} className="point-chat-card">
              <div className="point-chat-label">
                {card.label}
                {showTranslation && translationCard?.label && (
                  <p className="appendix-meta translation-note">{translationCard.label}</p>
                )}
              </div>
              <p className="point-chat-spanish">{card.spanish}</p>
              {showTranslation && (translationCard?.sentence || translationCard?.text) && (
                <p className="point-chat-english translation-note">
                  {translationCard.sentence || translationCard.text}
                </p>
              )}
              {(card.gesture || card.tip) && (
                <div className="point-chat-meta">
                  {card.gesture && (
                    <span className="badge">
                      {card.gesture}
                      {showTranslation && translationCard?.gesture && (
                        <span className="appendix-meta translation-note">{translationCard.gesture}</span>
                      )}
                    </span>
                  )}
                  {card.tip && (
                    <p>
                      {card.tip}
                      {showTranslation && translationCard?.tip && (
                        <span className="appendix-meta translation-note">{translationCard.tip}</span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default PointAndChat

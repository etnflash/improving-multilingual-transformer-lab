import React from 'react'

// Presents swaps that tie contexts to grammar choices, showing translations on demand
function SwapChart({ data, translations, showTranslation }) {
  const { title, subtitle, rows = [] } = data || {}
  const overlay = translations || {}

  if (!rows.length) {
    return null
  }

  const fallbackRowTranslation = (row) => {
    if (!row) {
      return null
    }

    if (typeof row.english === 'string') {
      return { sentence: row.english }
    }

    if (row.translation && typeof row.translation === 'object') {
      return row.translation
    }

    return null
  }

  return (
    <section className="topic-widget swap-chart">
      <header className="topic-widget-head">
        <div>
          <h3>{title || 'Context swap chart'}</h3>
          {subtitle && <p className="appendix-meta">{subtitle}</p>}
          {showTranslation && overlay.title && (
            <p className="appendix-meta translation-note">{overlay.title}</p>
          )}
          {showTranslation && overlay.subtitle && (
            <p className="appendix-meta translation-note">{overlay.subtitle}</p>
          )}
        </div>
      </header>
      <div className="swap-chart-grid">
        {rows.map((row, index) => {
          const translationRow = overlay.rows?.[index] || fallbackRowTranslation(row)

          return (
            <article key={`${row.distance}-${index}`} className="swap-chart-row">
              <div className="swap-distance">
                {row.distance}
                {showTranslation && translationRow?.distance && (
                  <p className="appendix-meta translation-note">{translationRow.distance}</p>
                )}
              </div>
              <div className="swap-content">
                <p className="swap-spanish">{row.spanish}</p>
                {showTranslation && (translationRow?.sentence || translationRow?.text) && (
                  <p className="swap-english translation-note">
                    {translationRow.sentence || translationRow.text}
                  </p>
                )}
                <div className="swap-helpers">
                  {row.quantity && (
                    <span className="badge badge-muted">
                      {row.quantity}
                      {showTranslation && translationRow?.quantity && (
                        <span className="appendix-meta translation-note">{translationRow.quantity}</span>
                      )}
                    </span>
                  )}
                  {row.cue && (
                    <span className="appendix-meta">
                      {row.cue}
                      {showTranslation && translationRow?.cue && (
                        <span className="appendix-meta translation-note">{translationRow.cue}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default SwapChart

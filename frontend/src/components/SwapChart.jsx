import React from 'react'

// Presents near/mid/far swaps that tie demonstratives to context clues
function SwapChart({ data }) {
  const { title, subtitle, rows = [] } = data || {}

  if (!rows.length) {
    return null
  }

  return (
    <section className="topic-widget swap-chart">
      <header className="topic-widget-head">
        <div>
          <h3>{title || 'Context swap chart'}</h3>
          {subtitle && <p className="appendix-meta">{subtitle}</p>}
        </div>
      </header>
      <div className="swap-chart-grid">
        {rows.map((row, index) => (
          <article key={`${row.distance}-${index}`} className="swap-chart-row">
            <div className="swap-distance">{row.distance}</div>
            <div className="swap-content">
              <p className="swap-spanish">{row.spanish}</p>
              <p className="swap-english">{row.english}</p>
              <div className="swap-helpers">
                {row.quantity && <span className="badge badge-muted">{row.quantity}</span>}
                {row.cue && <span className="appendix-meta">{row.cue}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default SwapChart

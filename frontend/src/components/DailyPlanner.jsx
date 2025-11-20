import React from 'react'

// Visualizes a bilingual daily planner for time-frequency practice
function DailyPlanner({ data }) {
  const { title, subtitle, slots = [] } = data || {}

  if (!slots.length) {
    return null
  }

  return (
    <section className="topic-widget daily-planner">
      <header className="topic-widget-head">
        <div>
          <h3>{title || 'Planner'}</h3>
          {subtitle && <p className="appendix-meta">{subtitle}</p>}
        </div>
      </header>
      <div className="planner-grid">
        {slots.map((slot, index) => (
          <article key={`${slot.timeRange}-${index}`} className="planner-slot">
            <div className="planner-time">{slot.timeRange}</div>
            <div className="planner-body">
              <p className="planner-label">{slot.label}</p>
              <p className="planner-phrase">{slot.phrase}</p>
              <div className="planner-meta">
                {slot.frequency && <span className="badge">{slot.frequency}</span>}
                {slot.tip && <span className="appendix-meta">{slot.tip}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DailyPlanner

import React from 'react'

// Highlights stress and melody cues for key phrases
function ProsodyNotes({ data }) {
  const { title = 'Prosodia aplicada', subtitle, items = [] } = data || {}

  if (!items.length) {
    return null
  }

  return (
    <section className="topic-widget prosody-notes">
      <header className="topic-widget-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p className="appendix-meta">{subtitle}</p>}
        </div>
      </header>
      <div className="prosody-list">
        {items.map((note, index) => (
          <article key={`${note.phrase}-${index}`} className="prosody-card">
            <div className="prosody-head">
              <p className="prosody-phrase">{note.phrase}</p>
              {note.tag && <span className="badge badge-muted">{note.tag}</span>}
            </div>
            <p className="prosody-stress">{note.stress}</p>
            {note.tip && <p className="appendix-meta">{note.tip}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProsodyNotes

import React from 'react'

const sections = [
  {
    id: 'intro',
    title: 'Intro',
    body: (
      <>
        <p>
          Welcome to the Multilingual Transformer Lab. This workspace mirrors the structure of the convex optimization
          reference we explored earlier, but swaps in brighter colors and conversational copy to spark creativity. Use it to
          test multilingual prompts, debug attention behavior, and document insights.
        </p>
        <p>
          Every section below maps to a future interactive widget. For now, read the descriptions, plan your experiments,
          and imagine the playful modules that will soon live here.
        </p>
      </>
    )
  },
  {
    id: 'how-to-use',
    title: 'How to Use',
    body: (
      <>
        <ol>
          <li>Pick a task from the sidebar.</li>
          <li>Load sample sentences or upload your own short corpus.</li>
          <li>Inspect model feedback, jot observations, and iterate.</li>
        </ol>
        <p>
          This flow keeps the experience lightweight so you can focus on patterns instead of wiring. Keyboard shortcuts and
          presets will land in later iterations.
        </p>
      </>
    )
  },
  {
    id: 'pattern-practice',
    title: 'Pattern Practice',
    body: (
      <p>
        Prototype few-shot prompts that teach the model rhythmic or grammatical patterns across languages. Compare responses
        side by side before locking in instructions.
      </p>
    )
  },
  {
    id: 'sentence-correction',
    title: 'Sentence Correction',
    body: (
      <p>
        Drop in learner sentences, highlight errors, and show suggested fixes with explanations tailored to different
        proficiency levels.
      </p>
    )
  },
  {
    id: 'tokenization',
    title: 'Tokenization Visualization',
    body: (
      <p>
        Explore how multilingual tokenizers break down phrases, and surface surprising subword splits that might impact
        translation quality.
      </p>
    )
  },
  {
    id: 'attention',
    title: 'Attention Maps',
    body: (
      <p>
        Inspect encoder and decoder attention to see how the model balances source and target context. Use this space to
        capture screenshots and hypotheses.
      </p>
    )
  },
  {
    id: 'appendix',
    title: 'Appendix Preview',
    body: (
      <p>
        Browse CEFR-aligned grammar, vocabulary, and mini dialogues for each language. Choose a language and level to load
        content directly from JSON files—no code changes needed when you add more data.
      </p>
    )
  }
]

function LabOverview() {
  return (
    <div className="lab-overview">
      <section className="hero-block">
        <p className="hero-eyebrow">Language Learning Sandbox</p>
        <h1>Playful Experiments with Multilingual Transformers</h1>
        <p className="hero-lede">
          Prototype sentences, peek inside transformer layers, and keep each experiment language-agnostic. The surface feels
          familiar, but every module is wired for quick iteration.
        </p>
      </section>

      <div className="lab-layout">
        <aside className="lab-sidebar" aria-label="Lab sections">
          <h3>Lab Guide</h3>
          <ul>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="lab-sections">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="card">
              <h2>{section.title}</h2>
              {section.body}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LabOverview

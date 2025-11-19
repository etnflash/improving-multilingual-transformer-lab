import React from 'react'

function Home() {
  return (
    <div>
      <div className="card">
        <h1>Welcome to Multilingual Transformer Lab</h1>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginTop: '1rem' }}>
          Learn languages and understand transformer internals simultaneously through interactive modules.
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <h2>📚 Pattern Learning</h2>
          <p>
            Master grammatical patterns with structured examples and practice exercises. 
            Each pattern includes clear explanations and interactive practice.
          </p>
        </div>

        <div className="card">
          <h2>✏️ Sentence Correction</h2>
          <p>
            Improve your writing with AI-powered correction suggestions. 
            Get instant feedback on grammar, punctuation, and style.
          </p>
        </div>

        <div className="card">
          <h2>💬 Dialog Simulation</h2>
          <p>
            Practice real-world conversations through interactive dialog scenarios. 
            Learn common phrases and expressions in context.
          </p>
        </div>

        <div className="card">
          <h2>🔬 Transformer Introspection</h2>
          <p>
            Explore how transformers process language with tokenization, 
            embeddings, and attention visualization tools.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Features</h2>
        <ul style={{ lineHeight: '2', marginLeft: '2rem', marginTop: '1rem' }}>
          <li>✨ Language-agnostic architecture with JSON-based content</li>
          <li>🌐 Support for multiple languages (English, Spanish, French, and more)</li>
          <li>🤖 Integration with multilingual transformer models</li>
          <li>📊 Visual exploration of tokenization and attention mechanisms</li>
          <li>🎯 Interactive learning modules for hands-on practice</li>
        </ul>
      </div>
    </div>
  )
}

export default Home

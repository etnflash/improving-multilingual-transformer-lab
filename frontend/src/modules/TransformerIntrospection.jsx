import React, { useState } from 'react'
import axios from 'axios'

function TransformerIntrospection() {
  const [text, setText] = useState('Hello, how are you today?')
  const [mode, setMode] = useState('tokenize')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [layer, setLayer] = useState(0)

  const handleAnalyze = async () => {
    if (!text.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let response
      if (mode === 'tokenize') {
        response = await axios.post('/api/tokenize', { text })
      } else if (mode === 'embeddings') {
        response = await axios.post('/api/embeddings', { text })
      } else if (mode === 'attention') {
        response = await axios.post('/api/attention', { text, layer })
      }
      setResult(response.data)
    } catch (err) {
      setError('Failed to analyze. Make sure the backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getAttentionColor = (value) => {
    const intensity = Math.floor(value * 255)
    return `rgb(${255 - intensity}, ${255 - intensity}, 255)`
  }

  return (
    <div>
      <div className="card">
        <h1>🔬 Transformer Introspection</h1>
        <p>Explore how transformers process language through tokenization, embeddings, and attention mechanisms.</p>
      </div>

      <div className="card">
        <div className="input-group">
          <label htmlFor="text">Enter text to analyze:</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text here..."
            rows="3"
          />
        </div>

        <div className="input-group">
          <label htmlFor="mode">Analysis Mode:</label>
          <select 
            id="mode"
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="tokenize">Tokenization</option>
            <option value="embeddings">Embeddings</option>
            <option value="attention">Attention Visualization</option>
          </select>
        </div>

        {mode === 'attention' && (
          <div className="input-group">
            <label htmlFor="layer">Layer (0-11):</label>
            <input
              id="layer"
              type="number"
              min="0"
              max="11"
              value={layer}
              onChange={(e) => setLayer(parseInt(e.target.value))}
            />
          </div>
        )}

        <button 
          className="button" 
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>

        {error && (
          <div className="error" style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}
      </div>

      {result && mode === 'tokenize' && (
        <div className="card">
          <h2>Tokenization Results</h2>
          <p style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
            Vocabulary Size: {result.vocab_size.toLocaleString()} tokens
          </p>
          
          <h3>Tokens:</h3>
          <div className="token-list">
            {result.tokens.map((token, index) => (
              <div key={index} className="token">
                {token}
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '2rem' }}>Token IDs:</h3>
          <div className="visualization">
            <code style={{ fontSize: '0.9rem' }}>
              [{result.token_ids.join(', ')}]
            </code>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <strong>About Tokenization:</strong>
            <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
              Tokenization is the process of breaking text into smaller units (tokens) that the model can process. 
              The multilingual BERT model uses WordPiece tokenization, which can split words into subword units. 
              This allows the model to handle any word, even ones it hasn't seen during training.
            </p>
          </div>
        </div>
      )}

      {result && mode === 'embeddings' && (
        <div className="card">
          <h2>Embeddings Results</h2>
          <p style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
            Shape: {result.shape.join(' × ')} (tokens × embedding dimension)
          </p>

          <h3>Tokens:</h3>
          <div className="token-list">
            {result.tokens.map((token, index) => (
              <div key={index} className="token">
                {token}
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '2rem' }}>Embedding Visualization:</h3>
          <div className="visualization">
            <p style={{ marginBottom: '1rem' }}>First 10 dimensions for each token:</p>
            {result.embeddings.map((embedding, idx) => (
              <div key={idx} style={{ marginBottom: '0.5rem' }}>
                <strong>{result.tokens[idx]}:</strong> [
                {embedding.slice(0, 10).map(v => v.toFixed(3)).join(', ')}
                ...]
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <strong>About Embeddings:</strong>
            <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
              Embeddings are dense vector representations of tokens. Each token is represented as a 768-dimensional 
              vector (in BERT-base). These vectors capture semantic meaning - similar words have similar embeddings. 
              The model learns these representations during training.
            </p>
          </div>
        </div>
      )}

      {result && mode === 'attention' && (
        <div className="card">
          <h2>Attention Visualization</h2>
          <p style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
            Layer {layer} • {result.num_layers} layers • {result.num_heads} attention heads
          </p>

          <h3>Tokens:</h3>
          <div className="token-list">
            {result.tokens.map((token, index) => (
              <div key={index} className="token">
                {token}
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '2rem' }}>Attention Matrix (averaged across heads):</h3>
          <div className="visualization">
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
              Rows: Query tokens, Columns: Key tokens. Color intensity shows attention weight.
            </p>
            <div 
              className="attention-matrix"
              style={{ 
                gridTemplateColumns: `repeat(${result.tokens.length}, 1fr)`,
                maxWidth: '600px'
              }}
            >
              {result.attention.map((row, i) => 
                row.map((value, j) => (
                  <div 
                    key={`${i}-${j}`}
                    className="attention-cell"
                    style={{ 
                      backgroundColor: getAttentionColor(value),
                      color: value > 0.5 ? 'white' : 'black'
                    }}
                    title={`${result.tokens[i]} → ${result.tokens[j]}: ${value.toFixed(3)}`}
                  >
                    {value.toFixed(2)}
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <strong>About Attention:</strong>
            <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
              Attention mechanisms allow the model to focus on different parts of the input when processing each token. 
              The attention matrix shows how much each token (row) attends to every other token (column). 
              Higher values (darker blue) indicate stronger attention. This is averaged across all {result.num_heads} attention heads.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransformerIntrospection

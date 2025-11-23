import React, { useEffect, useState } from 'react'
import axios from 'axios'

const SLOT_LABELS = {
  primary: 'Model A',
  secondary: 'Model B'
}

const EMPTY_RESULTS = {
  primary: null,
  secondary: null
}

const INITIAL_HEADS = {
  primary: 'average',
  secondary: 'average'
}

function TransformerIntrospection() {
  const [text, setText] = useState('Hello, how are you today?')
  const [mode, setMode] = useState('tokenize')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [layer, setLayer] = useState(0)
  const [models, setModels] = useState([])
  const [modelsError, setModelsError] = useState(null)
  const [comparisonEnabled, setComparisonEnabled] = useState(false)
  const [selectedModels, setSelectedModels] = useState({ primary: '', secondary: '' })
  const [results, setResults] = useState(EMPTY_RESULTS)
  const [headSelections, setHeadSelections] = useState(INITIAL_HEADS)

  useEffect(() => {
    let isMounted = true

    const fetchModels = async () => {
      try {
        const response = await axios.get('/api/models')
        if (!isMounted) {
          return
        }
        const availableModels = response.data?.models ?? []
        const defaultModel = response.data?.default ?? availableModels[0]?.id ?? 'bert-base-multilingual-cased'
        const fallbackSecondary = availableModels[1]?.id || defaultModel
        let savedSelections = null
        if (typeof window !== 'undefined') {
          const raw = window.localStorage.getItem('introspection:modelSelections')
          if (raw) {
            try {
              savedSelections = JSON.parse(raw)
            } catch (parseErr) {
              console.error('Failed to parse saved model selections', parseErr)
            }
          }
        }
        setModels(availableModels)
        setSelectedModels({
          primary: savedSelections?.primary || defaultModel,
          secondary: savedSelections?.secondary || fallbackSecondary
        })
      } catch (err) {
        console.error('Failed to load model list', err)
        if (!isMounted) {
          return
        }
        const fallback = [
          { id: 'bert-base-multilingual-cased', label: 'mBERT Base' }
        ]
        setModels(fallback)
        setSelectedModels({
          primary: 'bert-base-multilingual-cased',
          secondary: 'bert-base-multilingual-cased'
        })
        setModelsError('Unable to load model catalog; defaulting to multilingual BERT.')
      }
    }

    fetchModels()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedModels.primary) {
      return
    }
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('introspection:modelSelections', JSON.stringify(selectedModels))
      }
    } catch (storageErr) {
      console.error('Failed to persist model selections', storageErr)
    }
  }, [selectedModels])

  useEffect(() => {
    if (!comparisonEnabled) {
      setResults((prev) => ({ ...prev, secondary: null }))
    }
  }, [comparisonEnabled])

  const getModelLabel = (modelId) => {
    if (!modelId) {
      return ''
    }
    const match = models.find((modelItem) => modelItem.id === modelId)
    return match?.label || modelId
  }

  const slotsToRender = comparisonEnabled ? ['primary', 'secondary'] : ['primary']
  const referenceResult = results.primary || results.secondary
  const maxLayerIndex = referenceResult ? referenceResult.num_layers - 1 : 11
  const modelSummary = comparisonEnabled
    ? `${getModelLabel(selectedModels.primary) || 'Loading…'} vs ${getModelLabel(selectedModels.secondary) || 'Loading…'}`
    : getModelLabel(selectedModels.primary) || 'Loading…'
  const isAnalyzeDisabled =
    loading ||
    !text.trim() ||
    !selectedModels.primary ||
    (comparisonEnabled && !selectedModels.secondary)

  const handleModelChange = (slot, value) => {
    setSelectedModels((prev) => ({
      ...prev,
      [slot]: value
    }))
  }

  const handleHeadSelection = (slot, value) => {
    setHeadSelections((prev) => ({
      ...prev,
      [slot]: value
    }))
  }

  const handleAnalyze = async () => {
    if (!text.trim()) {
      return
    }

    const activeSlots = comparisonEnabled ? ['primary', 'secondary'] : ['primary']
    const missingSelection = activeSlots.filter((slot) => !selectedModels[slot])
    if (missingSelection.length) {
      setError('Please select a model for each active comparison slot.')
      return
    }

    setLoading(true)
    setError(null)
    setResults(EMPTY_RESULTS)

    try {
      const requests = activeSlots.map((slot) => {
        const payload = { text, model: selectedModels[slot] }
        if (mode === 'tokenize') {
          return axios.post('/api/tokenize', payload)
        }
        if (mode === 'embeddings') {
          return axios.post('/api/embeddings', payload)
        }
        return axios.post('/api/attention', { ...payload, layer })
      })

      const responses = await Promise.all(requests)
      const updatedResults = { ...EMPTY_RESULTS }
      const updatedHeads = {}

      responses.forEach((response, index) => {
        const slot = activeSlots[index]
        updatedResults[slot] = response.data
        updatedHeads[slot] = 'average'
      })

      setResults((prev) => ({ ...prev, ...updatedResults }))
      if (mode === 'attention') {
        setHeadSelections((prev) => ({ ...prev, ...updatedHeads }))
      }
    } catch (err) {
      console.error(err)
      setError('Failed to analyze. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const getAttentionColor = (value) => {
    const intensity = Math.floor(value * 255)
    return `rgb(${255 - intensity}, ${255 - intensity}, 255)`
  }

  const renderSlotMeta = (slot) => (
    <div className="slot-meta">
      <strong>{comparisonEnabled ? SLOT_LABELS[slot] : 'Model'}</strong>
      <span>{getModelLabel(selectedModels[slot]) || 'Loading…'}</span>
    </div>
  )

  const renderTokenizationPanels = () => {
    if (mode !== 'tokenize') {
      return null
    }
    const cards = slotsToRender
      .map((slot) => {
        const slotResult = results[slot]
        if (!slotResult) {
          return null
        }
        return (
          <div key={`${slot}-tokens`} className="card">
            {renderSlotMeta(slot)}
            <h2>Tokenization Results</h2>
            <p style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
              Vocabulary Size: {slotResult.vocab_size.toLocaleString()} tokens
            </p>

            <h3>Tokens:</h3>
            <div className="token-list">
              {slotResult.tokens.map((token, index) => (
                <div key={index} className="token">
                  {token}
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: '2rem' }}>Token IDs:</h3>
            <div className="visualization">
              <code style={{ fontSize: '0.9rem' }}>
                [{slotResult.token_ids.join(', ')}]
              </code>
            </div>
          </div>
        )
      })
      .filter(Boolean)

    if (!cards.length) {
      return null
    }

    return (
      <div>
        <div className={comparisonEnabled ? 'comparison-grid' : undefined}>{cards}</div>
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <strong>About Tokenization:</strong>
          <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
            Tokenization breaks text into the units a model can process. Multilingual checkpoints commonly use 
            subword vocabularies (WordPiece or SentencePiece) so even unfamiliar words can be represented by combining 
            smaller pieces.
          </p>
        </div>
      </div>
    )
  }

  const renderEmbeddingPanels = () => {
    if (mode !== 'embeddings') {
      return null
    }
    const cards = slotsToRender
      .map((slot) => {
        const slotResult = results[slot]
        if (!slotResult) {
          return null
        }
        return (
          <div key={`${slot}-embeddings`} className="card">
            {renderSlotMeta(slot)}
            <h2>Embeddings Results</h2>
            <p style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
              Shape: {slotResult.shape.join(' × ')} (tokens × embedding dimension)
            </p>

            <h3>Tokens:</h3>
            <div className="token-list">
              {slotResult.tokens.map((token, index) => (
                <div key={index} className="token">
                  {token}
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: '2rem' }}>Embedding Visualization:</h3>
            <div className="visualization">
              <p style={{ marginBottom: '1rem' }}>First 10 dimensions for each token:</p>
              {slotResult.embeddings.map((embedding, idx) => (
                <div key={idx} style={{ marginBottom: '0.5rem' }}>
                  <strong>{slotResult.tokens[idx]}:</strong> [
                  {embedding.slice(0, 10).map((value) => value.toFixed(3)).join(', ')}
                  ...]
                </div>
              ))}
            </div>
          </div>
        )
      })
      .filter(Boolean)

    if (!cards.length) {
      return null
    }

    return (
      <div>
        <div className={comparisonEnabled ? 'comparison-grid' : undefined}>{cards}</div>
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <strong>About Embeddings:</strong>
          <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
            Embeddings turn tokens into dense vectors (768 dimensions for most base models). Nearby vectors often 
            represent semantically related words, which enables downstream tasks to reason about meaning.
          </p>
        </div>
      </div>
    )
  }

  const renderAttentionPanels = () => {
    if (mode !== 'attention') {
      return null
    }
    const cards = slotsToRender
      .map((slot) => {
        const slotResult = results[slot]
        if (!slotResult) {
          return null
        }
        const activeHead = headSelections[slot] ?? 'average'
        const perHead = slotResult.attention?.per_head
        const averageMatrix = perHead ? slotResult.attention.average : slotResult.attention
        const matrixToRender = perHead && activeHead !== 'average'
          ? perHead[activeHead] || averageMatrix
          : averageMatrix

        return (
          <div key={`${slot}-attention`} className="card">
            {renderSlotMeta(slot)}
            <h2>Attention Visualization</h2>
            <p style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
              Layer {layer} • {slotResult.num_layers} layers • {slotResult.num_heads} attention heads
            </p>

            {perHead && (
              <div className="head-selector-panel">
                <div className="head-selector-heading">
                  <h3>Attention heads</h3>
                  <p className="appendix-meta">Pick a head to inspect its matrix</p>
                </div>
                <div className="head-selector-grid">
                  <button
                    type="button"
                    className={`head-chip ${activeHead === 'average' ? 'is-active' : ''}`}
                    onClick={() => handleHeadSelection(slot, 'average')}
                  >
                    Avg
                    <span className="appendix-meta">All heads</span>
                  </button>
                  {perHead.map((_, headIndex) => {
                    const maxFocus = slotResult.head_stats?.max_focus?.[headIndex]
                    const entropy = slotResult.head_stats?.entropy?.[headIndex]
                    return (
                      <button
                        key={`head-${slot}-${headIndex}`}
                        type="button"
                        className={`head-chip ${activeHead === headIndex ? 'is-active' : ''}`}
                        onClick={() => handleHeadSelection(slot, headIndex)}
                      >
                        H{headIndex}
                        <span className="appendix-meta">
                          {maxFocus !== undefined ? `${Math.round(maxFocus * 100)}% focus` : '—'} ·{' '}
                          {entropy !== undefined ? `${entropy.toFixed(2)}H` : '—'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <h3>Tokens:</h3>
            <div className="token-list">
              {slotResult.tokens.map((token, index) => (
                <div key={index} className="token">
                  {token}
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: '2rem' }}>
              {perHead && activeHead !== 'average'
                ? `Attention Matrix · Head ${activeHead}`
                : 'Attention Matrix (averaged across heads)'}
            </h3>
            {perHead && activeHead !== 'average' && (
              <p className="appendix-meta" style={{ marginBottom: '0.5rem' }}>
                Showing head {activeHead} · entropy {slotResult.head_stats?.entropy?.[activeHead]?.toFixed(2) ?? '—'} ·
                max focus {slotResult.head_stats?.max_focus?.[activeHead] !== undefined
                  ? `${Math.round(slotResult.head_stats.max_focus[activeHead] * 100)}%`
                  : '—'}
              </p>
            )}
            <div className="visualization">
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                Rows: Query tokens, Columns: Key tokens. Color intensity shows attention weight.
              </p>
              <div
                className="attention-matrix"
                style={{
                  gridTemplateColumns: `repeat(${slotResult.tokens.length}, 1fr)`,
                  maxWidth: '600px'
                }}
              >
                {matrixToRender.map((row, rowIndex) =>
                  row.map((value, columnIndex) => (
                    <div
                      key={`${slot}-${rowIndex}-${columnIndex}`}
                      className="attention-cell"
                      style={{
                        backgroundColor: getAttentionColor(value),
                        color: value > 0.5 ? 'white' : 'black'
                      }}
                      title={`${slotResult.tokens[rowIndex]} → ${slotResult.tokens[columnIndex]}: ${value.toFixed(3)}`}
                    >
                      {value.toFixed(2)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      })
      .filter(Boolean)

    if (!cards.length) {
      return null
    }

    return (
      <div>
        <div className={comparisonEnabled ? 'comparison-grid' : undefined}>{cards}</div>
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <strong>About Attention:</strong>
          <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
            Attention highlights how each token distributes focus across the rest of the sequence. Darker squares show 
            stronger weights, revealing alignments and long-range dependencies. Matrices shown here reflect layer {layer} 
            and {referenceResult?.num_heads ?? 'all'} heads.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <h1>🔬 Transformer Introspection</h1>
        <p>Explore how transformers process language through tokenization, embeddings, and attention mechanisms.</p>
        <p className="appendix-meta" style={{ marginTop: '0.75rem' }}>
          Results are generated live from {modelSummary}.
        </p>
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

        <div className="input-group">
          <label htmlFor="model-primary">Model Checkpoint:</label>
          <select
            id="model-primary"
            value={selectedModels.primary}
            onChange={(e) => handleModelChange('primary', e.target.value)}
            disabled={!models.length}
          >
            {!selectedModels.primary && <option value="">Select a model</option>}
            {models.map((modelOption) => (
              <option key={modelOption.id} value={modelOption.id}>
                {modelOption.label}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group toggle-row">
          <label htmlFor="compare-toggle" className="toggle">
            <input
              id="compare-toggle"
              type="checkbox"
              checked={comparisonEnabled}
              onChange={(e) => setComparisonEnabled(e.target.checked)}
            />
            Compare two models side by side
          </label>
        </div>

        {comparisonEnabled && (
          <div className="input-group">
            <label htmlFor="model-secondary">Second Model:</label>
            <select
              id="model-secondary"
              value={selectedModels.secondary}
              onChange={(e) => handleModelChange('secondary', e.target.value)}
              disabled={!models.length}
            >
              {!selectedModels.secondary && <option value="">Select a model</option>}
              {models.map((modelOption) => (
                <option key={`second-${modelOption.id}`} value={modelOption.id}>
                  {modelOption.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === 'attention' && (
          <div className="input-group">
            <label htmlFor="layer">Layer (0 – {maxLayerIndex})</label>
            <input
              id="layer"
              type="number"
              min="0"
              max={maxLayerIndex}
              value={layer}
              onChange={(e) => {
                const nextValue = Number(e.target.value)
                if (Number.isNaN(nextValue)) {
                  setLayer(0)
                  return
                }
                const clamped = Math.max(0, Math.min(nextValue, maxLayerIndex))
                setLayer(clamped)
              }}
            />
          </div>
        )}

        <button
          className="button"
          onClick={handleAnalyze}
          disabled={isAnalyzeDisabled}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>

        {(error || modelsError) && (
          <div className="error" style={{ marginTop: '1rem' }}>
            {error || modelsError}
          </div>
        )}
      </div>

      {renderTokenizationPanels()}
      {renderEmbeddingPanels()}
      {renderAttentionPanels()}
    </div>
  )
}

export default TransformerIntrospection

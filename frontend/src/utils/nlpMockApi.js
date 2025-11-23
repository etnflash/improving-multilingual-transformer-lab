const MOCK_MODELS = [
  {
    id: 'bert-base-multilingual-cased',
    label: 'mBERT Base',
    vocabSize: 119547,
    layers: 12,
    heads: 12,
    embeddingSize: 768
  },
  {
    id: 'xlm-roberta-base',
    label: 'XLM-R Base',
    vocabSize: 250002,
    layers: 12,
    heads: 12,
    embeddingSize: 768
  },
  {
    id: 'distiluse-base-multilingual-cased',
    label: 'DistilUSE (Sentence Similarity)',
    vocabSize: 30522,
    layers: 6,
    heads: 12,
    embeddingSize: 512
  }
]

const DEFAULT_MODEL_ID = MOCK_MODELS[0].id
const ANALYSIS_DELAY = 250
const MAX_TOKENS = 32
const EMBEDDING_DIMENSION = 16

const LANGUAGE_HINTS = {
  es: [
    {
      type: 'accentuation',
      message: 'Parece faltar una tilde. Aseg\u00farate de acentuar palabras como "f\u00e1cil" o "ingl\u00e9s".',
      test: (text) => /\bfacil\b|\bingles\b/i.test(text),
      apply: (text) => text.replace(/facil/gi, 'f\u00e1cil').replace(/ingles/gi, 'ingl\u00e9s')
    },
    {
      type: 'gender agreement',
      message: 'Revisa la concordancia de g\u00e9nero entre art\u00edculos y sustantivos.',
      test: (text) => /el\s+[a\u00e1]gua/i.test(text),
      apply: (text) => text.replace(/el\s+agua/gi, 'el agua (f.)')
    }
  ],
  fr: [
    {
      type: 'elision',
      message: "En franc\u00e9s, se usa l' delante de vocales (por ejemplo l'\u00e9cole).",
      test: (text) => /le\s+[aeiou\u00e0\u00e2\u00e9\u00e8\u00ea\u00eb\u00ee\u00ef\u00f4\u00fb\u00f9]/i.test(text),
      apply: (text) => text.replace(/le\s+([aeiou\u00e0\u00e2\u00e9\u00e8\u00ea\u00eb\u00ee\u00ef\u00f4\u00fb\u00f9])/i, "l'$1")
    }
  ]
}

const delay = (ms = ANALYSIS_DELAY) => new Promise((resolve) => {
  setTimeout(resolve, ms)
})

const stringToSeed = (value) => {
  if (!value) {
    return 42
  }
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) + 1
}

const createRng = (seedValue) => {
  let seed = seedValue % 2147483647
  if (seed <= 0) {
    seed += 2147483646
  }
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

const tokenizeText = (text, rng) => {
  const cleaned = text.trim()
  if (!cleaned) {
    return ['[PAD]']
  }
  const rawTokens = cleaned
    .split(/(\s+)/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .flatMap((word) => {
      if (word.length <= 6) {
        return [word]
      }
      const splitIndex = Math.floor((rng() * (word.length - 3)) + 3)
      return [word.slice(0, splitIndex), `##${word.slice(splitIndex)}`]
    })
  return rawTokens.slice(0, MAX_TOKENS)
}

const tokenIdsFromTokens = (tokens) => tokens.map((token) => {
  let id = 0
  for (let i = 0; i < token.length; i += 1) {
    id = (id * 31 + token.charCodeAt(i)) % 50000
  }
  return id + 100
})

const buildEmbeddings = (tokens, rng) => tokens.map(() => (
  Array.from({ length: EMBEDDING_DIMENSION }, () => (rng() * 2 - 1))
))

const normalizeRow = (row) => {
  const total = row.reduce((sum, value) => sum + value, 0) || 1
  return row.map((value) => value / total)
}

const entropy = (distribution) => distribution.reduce((acc, value) => {
  if (value <= 0) {
    return acc
  }
  return acc - value * Math.log2(value)
}, 0)

const buildAttention = (tokens, rng, { layers, heads }) => {
  const headCount = Math.min(heads, 8)
  const perHead = Array.from({ length: headCount }, () => (
    tokens.map(() => normalizeRow(tokens.map(() => rng() + 0.01)))
  ))

  const average = tokens.map((_, rowIndex) => (
    tokens.map((__, columnIndex) => (
      perHead.reduce((sum, headMatrix) => sum + headMatrix[rowIndex][columnIndex], 0) / headCount
    ))
  ))

  const headStats = {
    max_focus: perHead.map((matrix) => (
      Math.max(...matrix.map((row) => Math.max(...row)))
    )),
    entropy: perHead.map((matrix) => (
      matrix.reduce((sum, row) => sum + entropy(row), 0) / matrix.length
    ))
  }

  return {
    tokens,
    num_layers: layers,
    num_heads: headCount,
    attention: {
      average,
      per_head: perHead
    },
    head_stats: headStats
  }
}

const runSentenceRules = (text, language) => {
  const suggestions = []
  let corrected = text.trim()

  if (!corrected) {
    return { suggestions, corrected: '' }
  }

  const firstChar = corrected.charAt(0)
  if (firstChar && /[a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\u00e0\u00e8\u00ec\u00f2\u00f9]/.test(firstChar)) {
    corrected = `${firstChar.toUpperCase()}${corrected.slice(1)}`
    suggestions.push({
      type: 'capitalization',
      message: 'La frase debe empezar con may\u00fascula.',
      suggestion: corrected
    })
  }

  if (!/[.!?]$/.test(corrected)) {
    corrected = `${corrected}.`
    suggestions.push({
      type: 'punctuation',
      message: 'A\u00f1ade puntuaci\u00f3n final para cerrar la idea.',
      suggestion: corrected
    })
  }

  if (/\s{2,}/.test(corrected)) {
    corrected = corrected.replace(/\s{2,}/g, ' ')
    suggestions.push({
      type: 'spacing',
      message: 'Reduce los espacios dobles para mejorar la claridad.',
      suggestion: corrected
    })
  }

  const languageRules = LANGUAGE_HINTS[language?.toLowerCase?.()] || []
  languageRules.forEach((rule) => {
    if (rule.test(corrected)) {
      corrected = rule.apply(corrected)
      suggestions.push({
        type: rule.type,
        message: rule.message,
        suggestion: corrected
      })
    }
  })

  return { suggestions, corrected }
}

export async function listModels() {
  await delay()
  return {
    models: MOCK_MODELS,
    default: DEFAULT_MODEL_ID
  }
}

export async function analyzeTokenization({ text, model }) {
  await delay()
  const seed = stringToSeed(`${model}:token:${text}`)
  const rng = createRng(seed)
  const tokens = tokenizeText(text, rng)
  return {
    tokens,
    token_ids: tokenIdsFromTokens(tokens),
    vocab_size: (MOCK_MODELS.find((item) => item.id === model) || MOCK_MODELS[0]).vocabSize
  }
}

export async function analyzeEmbeddings({ text, model }) {
  await delay()
  const seed = stringToSeed(`${model}:emb:${text}`)
  const rng = createRng(seed)
  const tokens = tokenizeText(text, rng)
  return {
    tokens,
    shape: [tokens.length, EMBEDDING_DIMENSION],
    embeddings: buildEmbeddings(tokens, rng)
  }
}

export async function analyzeAttention({ text, model, layer }) {
  await delay()
  const seed = stringToSeed(`${model}:attn:${text}:${layer}`)
  const rng = createRng(seed)
  const tokens = tokenizeText(text, rng)
  const modelSpec = MOCK_MODELS.find((item) => item.id === model) || MOCK_MODELS[0]
  return buildAttention(tokens, rng, modelSpec)
}

export async function correctSentence({ text, language }) {
  await delay()
  const { suggestions, corrected } = runSentenceRules(text, language)
  return {
    original: text.trim(),
    corrected,
    suggestions
  }
}

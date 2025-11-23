# Language Data Structure

All learner-facing language content for the Multilingual Transformer Lab lives in `data/languages`. Each language file contains:

- `language`: metadata (code, native name, base language, level, notes).
- `patternLearning`: pattern categories with examples, prompts, and checklist items.
- `sentenceCorrection`: error types plus feedback preferences so the correction module can stay language-agnostic.
- `dialogSimulation`: scenario definitions with scripted model turns and learner prompts.
- `transformerIntrospection`: tokenizer info, tokenization samples, and lightweight attention notes.

To add a new language:

1. Create a `{code}.json` file that matches the structure above.
2. Add the language entry to `languages/manifest.json` with `status: "live"` (or `coming-soon`).
3. The client will automatically load it once the file exists and the manifest is updated.

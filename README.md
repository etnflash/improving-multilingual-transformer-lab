# Multilingual Transformer Lab

A multilingual transformer-based language learning web application that combines interactive language learning with transformer model introspection.

## Features

- 🌍 **Language-Agnostic Architecture**: All language content stored in external JSON files
- 📚 **Pattern Learning**: Master grammatical patterns with examples and practice
- ✏️ **Sentence Correction**: Get AI-powered writing suggestions
- 💬 **Dialog Simulation**: Practice real-world conversations
- 🔬 **Transformer Introspection**: Explore tokenization, embeddings, and attention visualization

## Architecture

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Structure**:
  - `src/components/`: Reusable UI components
  - `src/modules/`: Learning modules (Pattern, Correction, Dialog, Introspection)
  - `src/data/`: Language content in JSON format

### Backend
- **Framework**: Flask (Python)
- **ML Models**: Hugging Face Transformers (bert-base-multilingual-cased)
- **Features**: Tokenization, embeddings extraction, attention visualization, sentence correction

### Data Structure
All language content is stored in `frontend/src/data/languages.json`:
```json
{
  "en": {
    "name": "English",
    "code": "en",
    "flag": "🇬🇧",
    "patterns": [...],
    "dialogs": [...]
  }
}
```

## Setup and Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- pip

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Start both servers** (backend and frontend)
2. **Open** `http://localhost:3000` in your browser
3. **Select a language** from the dropdown in the header
4. **Navigate** through different modules using the navigation bar

### Modules

#### Pattern Learning
- Browse grammatical patterns
- View examples with translations
- Practice with interactive exercises
- Get instant feedback on answers

#### Sentence Correction
- Enter text to check for errors
- Receive correction suggestions
- Learn about common mistakes
- See corrected versions

#### Dialog Simulation
- Choose conversation scenarios
- Step through realistic dialogs
- Practice with comprehension questions
- Learn context-appropriate phrases

#### Transformer Introspection
- **Tokenization**: See how text is broken into tokens
- **Embeddings**: View vector representations (768-dimensional)
- **Attention**: Visualize attention weights between tokens
- Understand transformer internals

## Adding New Languages

To add a new language, edit `frontend/src/data/languages.json`:

```json
{
  "de": {
    "name": "German",
    "code": "de",
    "flag": "🇩🇪",
    "patterns": [
      {
        "id": "pattern_id",
        "title": "Pattern Title",
        "explanation": "Pattern explanation",
        "examples": [
          { "sentence": "Example", "translation": "Translation" }
        ],
        "practice": [
          { "prompt": "Question", "answer": "Answer" }
        ]
      }
    ],
    "dialogs": [
      {
        "id": "dialog_id",
        "title": "Dialog Title",
        "scenario": "Dialog scenario",
        "conversation": [
          { "speaker": "Person A", "text": "Text" }
        ],
        "practice": [
          { "prompt": "Question", "answers": ["Answer1", "Answer2"] }
        ]
      }
    ]
  }
}
```

## API Endpoints

### Backend API

- `GET /api/health` - Health check
- `POST /api/tokenize` - Tokenize text
  ```json
  { "text": "Hello world", "model": "bert-base-multilingual-cased" }
  ```
- `POST /api/embeddings` - Get embeddings
  ```json
  { "text": "Hello world", "model": "bert-base-multilingual-cased" }
  ```
- `POST /api/attention` - Get attention weights
  ```json
  { "text": "Hello world", "layer": 0, "model": "bert-base-multilingual-cased" }
  ```
- `POST /api/correct` - Correct sentence
  ```json
  { "text": "hello world", "language": "en" }
  ```

## Project Structure

```
.
├── backend/
│   ├── app.py                 # Flask application
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Header.jsx
│   │   │   └── Home.jsx
│   │   ├── modules/          # Learning modules
│   │   │   ├── PatternLearning.jsx
│   │   │   ├── SentenceCorrection.jsx
│   │   │   ├── DialogSimulation.jsx
│   │   │   └── TransformerIntrospection.jsx
│   │   ├── data/             # Language data
│   │   │   └── languages.json
│   │   ├── App.jsx           # Main app component
│   │   ├── App.css           # Styles
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html            # HTML template
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
├── SETUP.md                  # Detailed setup guide
├── README.md                 # This file
└── LICENSE                   # MIT License
```

## Technologies Used

### Frontend
- React 18
- React Router v6
- Axios
- Vite

### Backend
- Flask
- Flask-CORS
- Transformers (Hugging Face)
- PyTorch
- NumPy

### Model
- bert-base-multilingual-cased (supports 104 languages)

## Contributing

Contributions are welcome! Here are some ideas:
- Add more languages to `languages.json`
- Add more patterns and dialogs
- Implement additional transformer introspection features
- Improve sentence correction with better models
- Add more visualization options

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Hugging Face for the Transformers library
- BERT multilingual model by Google Research

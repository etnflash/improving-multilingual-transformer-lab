# Multilingual Transformer Lab - Setup Guide

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

The backend will start on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 3. Access the Application

Open your browser and navigate to `http://localhost:3000`

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError` when running the backend
- **Solution**: Make sure you're in the backend directory and have installed all requirements:
  ```bash
  cd backend
  pip install -r requirements.txt
  ```

**Problem**: Models downloading slowly
- **Solution**: The first time you run the backend, it will download the BERT multilingual model (~700MB). This is normal and only happens once. Subsequent runs will use the cached model.

**Problem**: Port 5000 already in use
- **Solution**: Change the port in `backend/app.py`:
  ```python
  app.run(debug=True, port=5001)  # Change to 5001 or any available port
  ```
  And update the proxy in `frontend/vite.config.js` accordingly.

### Frontend Issues

**Problem**: `npm install` fails
- **Solution**: Make sure you have Node.js 18+ installed:
  ```bash
  node --version  # Should be 18.0.0 or higher
  ```

**Problem**: Port 3000 already in use
- **Solution**: Change the port in `frontend/vite.config.js`:
  ```javascript
  server: {
    port: 3001,  // Change to any available port
    // ...
  }
  ```

**Problem**: API calls failing
- **Solution**: Ensure the backend is running on port 5000. Check the browser console for error messages.

## Development Tips

### Hot Reloading

Both servers support hot reloading:
- **Frontend**: Changes to React components will automatically refresh
- **Backend**: Changes to Flask code will automatically restart the server (with `debug=True`)

### Testing API Endpoints

You can test backend endpoints directly using curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Tokenization
curl -X POST http://localhost:5000/api/tokenize \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how are you?"}'

# Embeddings
curl -X POST http://localhost:5000/api/embeddings \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how are you?"}'

# Attention
curl -X POST http://localhost:5000/api/attention \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how are you?", "layer": 0}'

# Correction
curl -X POST http://localhost:5000/api/correct \
  -H "Content-Type: application/json" \
  -d '{"text": "hello world", "language": "en"}'
```

## Production Build

### Frontend Production Build

```bash
cd frontend
npm run build
```

This creates an optimized production build in `frontend/dist/`

To preview the production build:
```bash
npm run preview
```

### Backend Production Deployment

For production, use a WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Environment Variables

You can configure the application using environment variables:

### Backend
Create a `.env` file in the `backend` directory:
```
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
MODEL_NAME=bert-base-multilingual-cased
```

### Frontend
Create a `.env` file in the `frontend` directory:
```
VITE_API_URL=http://localhost:5000
```

## Next Steps

1. **Explore the modules**: Try each learning module to understand the features
2. **Add languages**: Edit `frontend/src/data/languages.json` to add more languages
3. **Customize**: Modify the UI colors and styles in `frontend/src/App.css`
4. **Extend**: Add new API endpoints or frontend modules

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the main README.md
3. Open an issue on GitHub

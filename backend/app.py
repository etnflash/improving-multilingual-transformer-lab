from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np

app = Flask(__name__)
CORS(app)

# Cache for loaded models
model_cache = {}

def get_model_and_tokenizer(model_name="bert-base-multilingual-cased"):
    """Load and cache transformer model and tokenizer."""
    if model_name not in model_cache:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModel.from_pretrained(model_name, output_attentions=True)
        model_cache[model_name] = {"tokenizer": tokenizer, "model": model}
    return model_cache[model_name]["tokenizer"], model_cache[model_name]["model"]

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"})

@app.route('/api/tokenize', methods=['POST'])
def tokenize():
    """Tokenize text and return tokens."""
    data = request.json
    text = data.get('text', '')
    model_name = data.get('model', 'bert-base-multilingual-cased')
    
    try:
        tokenizer, _ = get_model_and_tokenizer(model_name)
        tokens = tokenizer.tokenize(text)
        token_ids = tokenizer.encode(text, add_special_tokens=True)
        
        return jsonify({
            "tokens": tokens,
            "token_ids": token_ids,
            "vocab_size": tokenizer.vocab_size
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/embeddings', methods=['POST'])
def embeddings():
    """Get embeddings for text."""
    data = request.json
    text = data.get('text', '')
    model_name = data.get('model', 'bert-base-multilingual-cased')
    
    try:
        tokenizer, model = get_model_and_tokenizer(model_name)
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        
        with torch.no_grad():
            outputs = model(**inputs)
            embeddings = outputs.last_hidden_state[0]
        
        tokens = tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
        
        return jsonify({
            "tokens": tokens,
            "embeddings": embeddings.numpy().tolist(),
            "shape": list(embeddings.shape)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/attention', methods=['POST'])
def attention():
    """Get attention weights for text."""
    data = request.json
    text = data.get('text', '')
    model_name = data.get('model', 'bert-base-multilingual-cased')
    layer = data.get('layer', 0)
    
    try:
        tokenizer, model = get_model_and_tokenizer(model_name)
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        
        with torch.no_grad():
            outputs = model(**inputs)
            attentions = outputs.attentions
        
        tokens = tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
        
        # Get attention for specified layer, average across heads
        layer_attention = attentions[layer][0].mean(dim=0).numpy()
        
        return jsonify({
            "tokens": tokens,
            "attention": layer_attention.tolist(),
            "num_layers": len(attentions),
            "num_heads": attentions[0].shape[1]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/correct', methods=['POST'])
def correct():
    """Simple sentence correction suggestions."""
    data = request.json
    text = data.get('text', '')
    language = data.get('language', 'en')
    
    # This is a placeholder - in production, you'd use a proper grammar checker
    # or fine-tuned model for correction
    suggestions = []
    
    # Basic checks
    if text and not text[0].isupper():
        suggestions.append({
            "type": "capitalization",
            "message": "Sentence should start with a capital letter",
            "suggestion": text[0].upper() + text[1:]
        })
    
    if text and not text.rstrip().endswith(('.', '!', '?')):
        suggestions.append({
            "type": "punctuation",
            "message": "Sentence should end with punctuation",
            "suggestion": text.rstrip() + "."
        })
    
    return jsonify({
        "original": text,
        "suggestions": suggestions,
        "corrected": suggestions[-1]["suggestion"] if suggestions else text
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)

# Registry of multilingual transformer checkpoints the UI can toggle between
AVAILABLE_MODELS = [
    {"id": "bert-base-multilingual-cased", "label": "mBERT Base"},
    {"id": "xlm-roberta-base", "label": "XLM-R Base"},
    {
        "id": "distilbert-base-multilingual-cased",
        "label": "DistilBERT Multilingual"
    }
]

# Cache for loaded models so we only download/instantiate once per server boot
model_cache = {}


def resolve_model_name(requested_name):
    """Return a supported Hugging Face identifier, falling back to default."""
    if not requested_name:
        return AVAILABLE_MODELS[0]["id"]
    supported_ids = {model["id"] for model in AVAILABLE_MODELS}
    if requested_name not in supported_ids:
        raise ValueError(
            f"Model '{requested_name}' is not enabled. Choose from: "
            f"{', '.join(sorted(supported_ids))}."
        )
    return requested_name


def get_model_and_tokenizer(model_name="bert-base-multilingual-cased"):
    """Load and cache transformer model and tokenizer."""
    if model_name not in model_cache:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModel.from_pretrained(model_name, output_attentions=True)
        model_cache[model_name] = {
            "tokenizer": tokenizer,
            "model": model
        }
    return (
        model_cache[model_name]["tokenizer"],
        model_cache[model_name]["model"]
    )


@app.route('/api/models', methods=['GET'])
def list_models():
    """Expose the list of enabled transformer checkpoints to the UI."""
    return jsonify({
        "default": AVAILABLE_MODELS[0]["id"],
        "models": AVAILABLE_MODELS
    })


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"})


@app.route('/api/tokenize', methods=['POST'])
def tokenize():
    """Tokenize text and return tokens."""
    data = request.json
    text = data.get('text', '')
    try:
        model_name = resolve_model_name(data.get('model'))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    
    try:
        tokenizer, _ = get_model_and_tokenizer(model_name)
        tokens = tokenizer.tokenize(text)
        token_ids = tokenizer.encode(text, add_special_tokens=True)
        
        return jsonify({
            "model": model_name,
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
    try:
        model_name = resolve_model_name(data.get('model'))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    
    try:
        tokenizer, model = get_model_and_tokenizer(model_name)
        inputs = tokenizer(
            text,
            return_tensors="pt",
            padding=True,
            truncation=True
        )
        
        with torch.no_grad():
            outputs = model(**inputs)
            embeddings = outputs.last_hidden_state[0]
        
        tokens = tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
        
        return jsonify({
            "model": model_name,
            "tokens": tokens,
            "embeddings": embeddings.numpy().tolist(),
            "shape": list(embeddings.shape)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/attention', methods=['POST'])
def attention():
    """Get attention weights for text, exposing per-head matrices."""
    data = request.json
    text = data.get('text', '')
    try:
        model_name = resolve_model_name(data.get('model'))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    layer = int(data.get('layer', 0))
    
    try:
        tokenizer, model = get_model_and_tokenizer(model_name)
        inputs = tokenizer(
            text,
            return_tensors="pt",
            padding=True,
            truncation=True
        )
        
        with torch.no_grad():
            outputs = model(**inputs)
            # tuple[num_layers] of (batch, heads, seq_len, seq_len)
            attentions = outputs.attentions

        num_layers = len(attentions)
        if layer < 0 or layer >= num_layers:
            max_layer = num_layers - 1
            return jsonify({
                "error": f"Layer index {layer} out of range (0-{max_layer})"
            }), 400

        tokens = tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
        # shape: (heads, seq_len, seq_len)
        layer_tensor = attentions[layer][0].cpu().numpy()

        # Summary statistics per head for quick highlighting in the UI
        epsilon = 1e-9
        head_max_focus = layer_tensor.max(axis=-1).mean(axis=-1).tolist()
        entropy_matrix = layer_tensor * np.log(layer_tensor + epsilon)
        head_entropy = (-entropy_matrix.sum(axis=-1).mean(axis=-1)).tolist()
        avg_attention = layer_tensor.mean(axis=0).tolist()
        
        return jsonify({
            "model": model_name,
            "tokens": tokens,
            "layer": layer,
            "num_layers": num_layers,
            "num_heads": layer_tensor.shape[0],
            "attention": {
                "per_head": layer_tensor.tolist(),
                "average": avg_attention
            },
            "head_stats": {
                "max_focus": head_max_focus,
                "entropy": head_entropy
            }
        })
    except Exception as e:
        app.logger.exception("/api/attention failed")
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
        "corrected": suggestions[-1]["suggestion"] if suggestions else text,
        "language": language
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)

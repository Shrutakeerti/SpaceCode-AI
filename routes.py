import os
import json
import logging
from flask import render_template, request, jsonify
from app import app, db
from models import Query
from services.ollama_service import OllamaService  
from datetime import datetime

logger = logging.getLogger(__name__)

ollama_service = OllamaService()  

logger.info("App initialized successfully")

@app.route('/')
def index():
    """Render the main application page."""
    return render_template('index.html')

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        recent_queries = Query.query.order_by(Query.created_at.desc()).limit(10).all()
        history = [{
            "code": q.code,
            "language": q.language,
            "request_type": q.request_type,
            "response": q.response,
            "timestamp": q.created_at.strftime("%Y-%m-%d %H:%M:%S") if q.created_at else "Invalid Date"  # Handle None case
        } for q in recent_queries]
        return jsonify(history)
    except Exception as e:
        logger.error(f"Failed to fetch history: {str(e)}")
        return jsonify({"error": "Unable to fetch history"}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_code():
    """Analyze the provided code using the AI service and analysis type."""
    try:
        data = request.get_json()
        
        code = data.get('code')
        language = data.get('language', 'python')
        ai_model = data.get('ai_model', 'ollama')  
        request_type = data.get('request_type', 'explain')
        
        if not code:
            return jsonify({"error": "No code provided"}), 400
            
        logger.debug(f"Received request to {request_type} {language} code using {ai_model}")
        
        if request_type == 'explain':
            result = ollama_service.explain_code(code, language)
        elif request_type == 'optimize':
            result = ollama_service.optimize_code(code, language)
        elif request_type == 'debug':
            result = ollama_service.debug_code(code, language)
        elif request_type == 'document':
            result = ollama_service.generate_documentation(code, language)
        elif request_type == 'security':
            result = ollama_service.security_review(code, language)
        else:
            return jsonify({"error": f"Invalid request type: {request_type}"}), 400
        
        
        query = Query(
            code=code,
            language=language,
            ai_model=ai_model,
            request_type=request_type,
            response=result.get('response') if 'response' in result else json.dumps(result),
            created_at=datetime.utcnow()  
        )
        db.session.add(query)
        db.session.commit()
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error processing code analysis request: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

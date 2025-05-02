from app import db
from flask_login import UserMixin
from datetime import datetime


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    password_hash = db.Column(db.String(256))
    queries = db.relationship('Query', backref='user', lazy=True)
    
class Query(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    code = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(50), nullable=False)
    ai_model = db.Column(db.String(50), nullable=False)
    request_type = db.Column(db.String(100), nullable=False)  
    response = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'language': self.language,
            'ai_model': self.ai_model,
            'request_type': self.request_type,
            'response': self.response,
            'created_at': self.created_at.isoformat()
        }
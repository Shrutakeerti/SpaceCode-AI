import os
from dotenv import load_dotenv


load_dotenv()

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)

app = Flask(__name__)


app.secret_key = os.environ.get("SESSION_SECRET", "d8c003561792d4d3f23f11b4f3c3a4db")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1) 


app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///spacecode.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

db.init_app(app)

with app.app_context():
    import models  # noqa: F401
    db.create_all()
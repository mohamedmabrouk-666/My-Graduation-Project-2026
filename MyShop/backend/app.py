# app.py
# This is the main entry point for the MyShop Flask application.
# It creates the Flask app and registers all route blueprints.

from flask import Flask                         # import Flask framework
import os                                       # import os for folder handling

from routes.auth import auth_bp                 # import auth blueprint (register/login)
from routes.products import products_bp         # import products blueprint
from routes.admin import admin_bp               # import admin blueprint

# ─── Create Flask App ──────────────────────────────────────────────────────────
app = Flask(__name__, static_folder="../frontend/html")  # point to HTML folder
app.secret_key = "secret123"                             # secret key for sessions

# ─── Upload Folder ─────────────────────────────────────────────────────────────
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'images')  # images folder path
os.makedirs(UPLOAD_FOLDER, exist_ok=True)                # create folder if not exists
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER              # save path in app config

# ─── Register Blueprints ───────────────────────────────────────────────────────
app.register_blueprint(auth_bp)                          # register auth routes
app.register_blueprint(products_bp)                      # register product routes
app.register_blueprint(admin_bp)                         # register admin routes

# ─── Run App ───────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(port=9002,debug=True)                                  # start Flask in debug mode
#   ------  Register + Login     ------------    
# routes/auth.py
# This file handles all authentication routes: register and login.
# It connects to MySQL and checks or saves user credentials.

from flask import Blueprint, request, redirect, send_from_directory, jsonify, session, current_app  # flask tools
import mysql.connector                                   # MySQL connector
import os                                               # for file path handling

# ─── Blueprint Setup ───────────────────────────────────────────────────────────
auth_bp = Blueprint('auth', __name__)                   # create auth blueprint

# ─── Database Connection Helper ───────────────────────────────────────────────
def get_db():
    # Connect to MySQL and return connection + cursor
    db = mysql.connector.connect(
        host="localhost",       # database host
        user="myuser",          # database username
        password="Myuser@123",  # database password
        database="myshop_db"    # database name
    )
    return db, db.cursor()      # return both connection and cursor

# ─── Helper: Serve Static Files ───────────────────────────────────────────────
@auth_bp.route('/frontend/<path:filename>')
def frontend_static(filename):
    frontend_folder = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend')  # path to frontend
    return send_from_directory(frontend_folder, filename)   # serve the file

# ─── Register Route ───────────────────────────────────────────────────────────
# GET  → show register page
# POST → save new user to database
@auth_bp.route('/register', methods=['GET', 'POST'])
def register():

    if request.method == 'GET':                          # user just visiting
        return send_from_directory(current_app.static_folder, 'register.html')  # show register page

    if request.method == 'POST':                         # form submitted
        name             = request.form.get('name')               # get name
        email            = request.form.get('email')              # get email
        password         = request.form.get('password')           # get password
        confirm_password = request.form.get('confirm_password')   # get confirm password

        if password != confirm_password:                 # passwords don't match
            return redirect('/register?error=password_mismatch')  # redirect with error

        db, cursor = get_db()                            # connect to database

        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))  # check if email exists
        if cursor.fetchone():                            # email already registered
            return redirect('/register?error=email_exists')       # redirect with error

        cursor.execute(                                  # insert new user
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, 'user')",
            (name, email, password)
        )
        db.commit()                                      # save to database

        return redirect('/login')                        # go to login page

# ─── Login Route ──────────────────────────────────────────────────────────────
# GET  → show login page
# POST → check credentials, save session, return JSON
@auth_bp.route('/login', methods=['GET', 'POST'])
def login():

    if request.method == 'GET':                          # user just visiting
        return send_from_directory(current_app.static_folder, 'login.html')  # show login page

    if request.method == 'POST':                         # form submitted via fetch
        email    = request.form.get('email')             # get email
        password = request.form.get('password')          # get password

        db, cursor = get_db()                            # connect to database

        cursor.execute(                                  # search for user
            "SELECT * FROM users WHERE email = %s AND password = %s",
            (email, password)
        )
        user = cursor.fetchone()                         # get user row

        if user:                                         # user found
            session['user_id'] = user[0]                 # save user id in session
            session['role']    = user[4]                 # save role in session (index 4 = role column)

            if user[4] == 'admin':                       # if user is admin
                return jsonify({"status": "success", "redirect": "/admin"})   # send to admin page

            return jsonify({"status": "success", "redirect": "/home"})        # send to home page

        return jsonify({"status": "error", "message": "Email or password is incorrect"})  # wrong credentials
# app.py
# This is the main Flask backend file.
# It handles routing for register and login pages,
# connects to MySQL database, and returns HTML pages or JSON responses.

from flask import Flask, request, redirect, send_from_directory, jsonify
import mysql.connector
import os

# Create Flask app and point it to the HTML folder
app = Flask(__name__, static_folder="../frontend/html")

# ─── Database Connection ───────────────────────────────────────────────────────
# Connect to MySQL using the project credentials
db = mysql.connector.connect(
    host="localhost",        # Database host
    user="myuser",           # Database username
    password="Myuser@123",   # Database password
    database="myshop_db"     # Database name
)

# Create a cursor to execute SQL queries
cursor = db.cursor()


# ─── Helper: Serve Static Files (CSS / JS) ────────────────────────────────────
# This route lets HTML pages load their CSS and JS files correctly
@app.route('/frontend/<path:filename>')
def frontend_static(filename):
    # Build the path to the frontend folder (one level up from backend)
    frontend_folder = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    return send_from_directory(frontend_folder, filename)  # Serve the requested file


# ─── Register Route ───────────────────────────────────────────────────────────
# GET  → show the register page
# POST → receive form data and save new user to database
@app.route('/register', methods=['GET', 'POST'])
def register():

    # If the browser is just visiting the page, return register.html
    if request.method == 'GET':
        return send_from_directory(app.static_folder, 'register.html')

    # If the form was submitted, process the registration
    if request.method == 'POST':

        # Get all fields from the submitted form
        name             = request.form.get('name')
        email            = request.form.get('email')
        password         = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # Check that both passwords are the same
        if password != confirm_password:
            return redirect('/register?error=password_mismatch')  # Redirect with error

        # Check if this email already exists in the database
        sql_check = "SELECT * FROM users WHERE email = %s"
        cursor.execute(sql_check, (email,))
        existing_user = cursor.fetchone()  # Returns a row if found, None if not

        # If email is already registered, redirect back with error
        if existing_user:
            return redirect('/register?error=email_exists')

        # Insert the new user into the database
        sql_insert = "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)"
        cursor.execute(sql_insert, (name, email, password))
        db.commit()  # Save changes to the database

        # After successful registration, send user to login page
        return redirect('/login')


# ─── Login Route ──────────────────────────────────────────────────────────────
# GET  → show the login page
# POST → check credentials and return JSON result (used by login.js fetch)
@app.route('/login', methods=['GET', 'POST'])
def login():

    # If the browser is just visiting the page, return login.html
    if request.method == 'GET':
        return send_from_directory(app.static_folder, 'login.html')

    # If the form was submitted via fetch (from login.js), check credentials
    if request.method == 'POST':

        # Get email and password from the request body
        email    = request.form.get('email')
        password = request.form.get('password')

        # Look for a user with matching email and password in the database
        sql = "SELECT * FROM users WHERE email = %s AND password = %s"
        cursor.execute(sql, (email, password))
        user = cursor.fetchone()  # Returns the user row if found

        # If user exists, return success response
        if user:
            return jsonify({"status": "success"})

        # If not found, return error response with a message
        else:
            return jsonify({
                "status": "error",
                "message": "Email or password is incorrect"
            })


# ─── Run App ──────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True)  # Start Flask in debug mode (shows errors in browser)
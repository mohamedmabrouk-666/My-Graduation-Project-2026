# routes/admin.py
# This file handles the admin dashboard routes.
# It protects the admin page and allows adding/deleting other admins.

from flask import Blueprint, request, jsonify, send_from_directory, session, current_app  # flask tools
import mysql.connector                                        # MySQL connector

# ─── Blueprint Setup ───────────────────────────────────────────────────────────
admin_bp = Blueprint('admin', __name__)                       # create admin blueprint

# ─── Database Connection Helper ───────────────────────────────────────────────
def get_db():
    db = mysql.connector.connect(
        host="localhost",        # database host
        user="myuser",           # database username
        password="Myuser@123",   # database password
        database="myshop_db"     # database name
    )
    return db, db.cursor()       # return connection and cursor

# ─── Admin Dashboard Page ─────────────────────────────────────────────────────
# Only accessible if session role is 'admin'
@admin_bp.route('/admin')
def admin_page():
    if session.get('role') != 'admin':                       # check if user is admin
        return "Access Denied", 403                          # block non-admins
    return send_from_directory(current_app.static_folder, 'admin.html')  # show dashboard

# ─── Get All Admins ───────────────────────────────────────────────────────────
@admin_bp.route('/get_admins')
def get_admins():
    if session.get('role') != 'admin':                       # check permission
        return jsonify({"error": "Access Denied"}), 403      # block non-admins
    db, cursor = get_db()                                    # connect to database
    cursor.execute("SELECT id, name, email FROM users WHERE role = 'admin'")  # get admins
    admins = cursor.fetchall()                               # fetch rows
    result = [{"id": a[0], "name": a[1], "email": a[2]} for a in admins]     # build list
    return jsonify(result)                                   # return as JSON

# ─── Add New Admin ────────────────────────────────────────────────────────────
@admin_bp.route('/add_admin', methods=['POST'])
def add_admin():
    if session.get('role') != 'admin':                       # check permission
        return jsonify({"error": "Access Denied"}), 403      # block non-admins
    name     = request.form.get('name')                      # get name
    email    = request.form.get('email')                     # get email
    password = request.form.get('password')                  # get password
    db, cursor = get_db()                                    # connect to database
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))   # check duplicate
    if cursor.fetchone():                                    # email already exists
        return jsonify({"error": "Email already exists"})    # return error
    cursor.execute(                                          # insert new admin
        "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, 'admin')",
        (name, email, password)
    )
    db.commit()                                              # save changes
    return jsonify({"message": "Admin added successfully"})  # return success

# ─── Delete Admin ─────────────────────────────────────────────────────────────
@admin_bp.route('/delete_admin/<int:admin_id>', methods=['DELETE'])
def delete_admin(admin_id):
    if session.get('role') != 'admin':                       # check permission
        return jsonify({"error": "Access Denied"}), 403      # block non-admins
    if admin_id == session.get('user_id'):                   # can't delete yourself
        return jsonify({"error": "Cannot delete yourself"})  # return error
    db, cursor = get_db()                                    # connect to database
    cursor.execute("DELETE FROM users WHERE id = %s AND role = 'admin'", (admin_id,))  # delete
    db.commit()                                              # save changes
    return jsonify({"message": "Admin deleted successfully"})             # return success
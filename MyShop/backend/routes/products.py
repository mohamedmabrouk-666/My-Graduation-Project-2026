# routes/products.py
# This file handles all product-related routes.
# It allows adding products, getting products, and managing categories.

from flask import Blueprint, request, jsonify, current_app   # flask tools
import mysql.connector                                        # MySQL connector
import os                                                     # for file paths

# ─── Blueprint Setup ───────────────────────────────────────────────────────────
products_bp = Blueprint('products', __name__)                 # create products blueprint

# ─── Database Connection Helper ───────────────────────────────────────────────
def get_db():
    db = mysql.connector.connect(
        host="localhost",        # database host
        user="myuser",           # database username
        password="Myuser@123",   # database password
        database="myshop_db"     # database name
    )
    return db, db.cursor()       # return connection and cursor

# ─── Get All Categories ────────────────────────────────────────────────────────
@products_bp.route('/get_categories')
def get_categories():
    db, cursor = get_db()                                     # connect to database
    cursor.execute("SELECT * FROM categories")                # get all categories
    categories = cursor.fetchall()                            # fetch all rows
    result = [{"id": cat[0], "name": cat[1]} for cat in categories]  # build list
    return jsonify(result)                                    # return as JSON

# ─── Add Category ─────────────────────────────────────────────────────────────
@products_bp.route('/add_category', methods=['POST'])
def add_category():
    name = request.form.get('name')                           # get category name
    db, cursor = get_db()                                     # connect to database
    cursor.execute("INSERT INTO categories (name) VALUES (%s)", (name,))  # insert
    db.commit()                                               # save changes
    return jsonify({"message": "Category added successfully"})            # return success

# ─── Add Product ──────────────────────────────────────────────────────────────
@products_bp.route('/add_product', methods=['POST'])
def add_product():
    name        = request.form.get('name')                    # get product name
    description = request.form.get('description')            # get description
    price       = request.form.get('price')                  # get price
    quantity    = request.form.get('quantity')               # get quantity
    category_id = request.form.get('category_id')            # get category id

    image = request.files.get('image')                       # get uploaded image
    image_filename = ''                                       # default empty filename

    if image and image.filename != '':                       # if image was uploaded
        image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image.filename)  # build path
        image.save(image_path)                               # save image to disk
        image_filename = image.filename                      # store filename

    db, cursor = get_db()                                    # connect to database
    cursor.execute(                                          # insert product
        "INSERT INTO products (name, description, price, quantity, image, category_id) VALUES (%s,%s,%s,%s,%s,%s)",
        (name, description, price, quantity, image_filename, category_id)
    )
    db.commit()                                              # save changes
    return jsonify({"message": "Product added successfully"})             # return success

# ─── Get All Products ─────────────────────────────────────────────────────────
@products_bp.route('/get_products')
def get_products():
    db, cursor = get_db()                                    # connect to database
    cursor.execute("""
        SELECT p.id, p.name, p.description, p.price, p.quantity, p.image, c.name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id      
    """)                                                     # join with categories
    products = cursor.fetchall()                             # fetch all rows
    result = []                                              # empty list
    for p in products:                                       # loop through products
        result.append({
            "id":          p[0],                             # product id
            "name":        p[1],                             # product name
            "description": p[2],                             # description
            "price":       float(p[3]),                      # price as float
            "quantity":    p[4],                             # quantity
            "image":       p[5],                             # image filename
            "category":    p[6]                              # category name
        })
    return jsonify(result)                                   # return as JSON

# ─── Delete Product ───────────────────────────────────────────────────────────
@products_bp.route('/delete_product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    db, cursor = get_db()                                    # connect to database
    cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))  # delete
    db.commit()                                              # save changes
    return jsonify({"message": "Product deleted successfully"})           # return success
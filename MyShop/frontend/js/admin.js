// admin.js
// This file controls all actions on the Admin Dashboard page.
// It communicates with the Flask backend using fetch() to:
//   - Load and display products, categories, and admins
//   - Add new products, categories, and admins
//   - Delete products and admins

// ─────────────────────────────────────────────────────────────────────────────
// SECTION NAVIGATION
// showSection() hides all sections and shows only the one the admin clicked
// It is called from each sidebar link in admin.html using onclick="showSection(...)"
// ─────────────────────────────────────────────────────────────────────────────

function showSection(id) {
    // Get all elements with class "section"
    const sections = document.querySelectorAll('.section');   // select all sections
    sections.forEach(sec => sec.classList.remove('active'));  // hide all sections

    // Show only the selected section
    document.getElementById(id).classList.add('active');      // show clicked section

    // Update active style on sidebar links
    const links = document.querySelectorAll('.sidebar a');    // get all sidebar links
    links.forEach(link => link.classList.remove('active'));   // remove active from all

    // Load data based on which section was opened
    if (id === 'products')   loadProducts();                  // load products list
    if (id === 'categories') loadCategories();                // load categories list
    if (id === 'admins')     loadAdmins();                    // load admins list
    if (id === 'add-product') loadCategoriesDropdown();       // load dropdown in form
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS — loadProducts()
// Sends GET request to /get_products
// Receives JSON array of products and builds a table row for each one
// Each row shows: image, name, category, price, quantity, delete button
// ─────────────────────────────────────────────────────────────────────────────

function loadProducts() {
    fetch('/get_products')                                    // request products from backend
        .then(res => res.json())                              // parse JSON response
        .then(products => {
            const tbody = document.getElementById('products-table-body');  // get table body
            tbody.innerHTML = '';                             // clear old rows

            products.forEach(p => {                          // loop through each product
                const row = document.createElement('tr');    // create table row
                row.innerHTML = `
                    <td><img src="/frontend/images/${p.image}" class="product-img" onerror="this.src=''"></td>
                    <td>${p.name}</td>
                    <td>${p.category || '—'}</td>
                    <td>${p.price} EGP</td>
                    <td>${p.quantity}</td>
                    <td><button class="btn-delete" onclick="deleteProduct(${p.id})">Delete</button></td>
                `;                                           // fill row with product data
                tbody.appendChild(row);                      // add row to table
            });
        });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS — deleteProduct(id)
// Sends DELETE request to /delete_product/<id>
// If successful, reloads the products table
// ─────────────────────────────────────────────────────────────────────────────

function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;            // ask for confirmation first

    fetch(`/delete_product/${id}`, { method: 'DELETE' })     // send delete request
        .then(res => res.json())                              // parse response
        .then(() => loadProducts());                         // reload table after delete
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS — addProduct()
// Reads form inputs, builds FormData (includes image file), sends POST to /add_product
// Shows success or error message below the form
// ─────────────────────────────────────────────────────────────────────────────

function addProduct() {
    const formData = new FormData();                          // create form data object (supports files)
    formData.append('name',        document.getElementById('p-name').value);       // add name
    formData.append('description', document.getElementById('p-desc').value);       // add description
    formData.append('price',       document.getElementById('p-price').value);      // add price
    formData.append('quantity',    document.getElementById('p-qty').value);        // add quantity
    formData.append('category_id', document.getElementById('p-category').value);  // add category
    formData.append('image',       document.getElementById('p-image').files[0]);  // add image file

    fetch('/add_product', { method: 'POST', body: formData })  // send to backend
        .then(res => res.json())                               // parse response
        .then(data => {
            const msg = document.getElementById('product-msg');  // get message element
            msg.textContent = data.message || data.error;     // show result message
            msg.className = data.message ? 'msg' : 'msg error'; // green or red style
            if (data.message) loadProducts();                 // refresh products if success
        });
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES — loadCategories()
// Sends GET request to /get_categories
// Builds a table showing all categories with their IDs
// ─────────────────────────────────────────────────────────────────────────────

function loadCategories() {
    fetch('/get_categories')                                  // request categories
        .then(res => res.json())                              // parse JSON
        .then(cats => {
            const tbody = document.getElementById('categories-table-body');  // get table
            tbody.innerHTML = '';                             // clear old rows

            cats.forEach(cat => {                            // loop through categories
                const row = document.createElement('tr');   // create row
                row.innerHTML = `
                    <td>${cat.id}</td>
                    <td>${cat.name}</td>
                `;                                           // fill with category data
                tbody.appendChild(row);                      // add to table
            });
        });
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES — loadCategoriesDropdown()
// Same as loadCategories() but fills the <select> in the Add Product form
// Called automatically when the admin opens the "Add Product" section
// ─────────────────────────────────────────────────────────────────────────────

function loadCategoriesDropdown() {
    fetch('/get_categories')                                  // request categories
        .then(res => res.json())                              // parse JSON
        .then(cats => {
            const select = document.getElementById('p-category');  // get dropdown
            select.innerHTML = '<option value="">Select category</option>';  // reset

            cats.forEach(cat => {                            // add each category as option
                const option = document.createElement('option');  // create option
                option.value = cat.id;                       // set value to id
                option.textContent = cat.name;               // set display text
                select.appendChild(option);                  // add to dropdown
            });
        });
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES — addCategory()
// Reads the category name input, sends POST to /add_category
// Shows success/error message and reloads the category table
// ─────────────────────────────────────────────────────────────────────────────

function addCategory() {
    const name = document.getElementById('cat-name').value;  // get input value
    const formData = new FormData();                         // create form data
    formData.append('name', name);                           // add name field

    fetch('/add_category', { method: 'POST', body: formData })  // send to backend
        .then(res => res.json())                              // parse response
        .then(data => {
            const msg = document.getElementById('category-msg');  // get message element
            msg.textContent = data.message || data.error;    // show result
            msg.className = data.message ? 'msg' : 'msg error';  // style
            if (data.message) loadCategories();              // reload table
        });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMINS — loadAdmins()
// Sends GET to /get_admins
// Builds a table showing all admin accounts with a delete button for each
// The delete button is disabled if it's the currently logged-in admin
// ─────────────────────────────────────────────────────────────────────────────

function loadAdmins() {
    fetch('/get_admins')                                      // request admins list
        .then(res => res.json())                              // parse JSON
        .then(admins => {
            const tbody = document.getElementById('admins-table-body');  // get table
            tbody.innerHTML = '';                             // clear old rows

            admins.forEach(a => {                            // loop through admins
                const row = document.createElement('tr');   // create row
                row.innerHTML = `
                    <td>${a.name}</td>
                    <td>${a.email}</td>
                    <td><button class="btn-delete" onclick="deleteAdmin(${a.id})">Delete</button></td>
                `;                                           // fill row
                tbody.appendChild(row);                      // add to table
            });
        });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMINS — addAdmin()
// Reads the add admin form inputs and sends POST to /add_admin
// Shows success/error and reloads the admins table
// ─────────────────────────────────────────────────────────────────────────────

function addAdmin() {
    const formData = new FormData();                          // create form data
    formData.append('name',     document.getElementById('a-name').value);      // admin name
    formData.append('email',    document.getElementById('a-email').value);     // admin email
    formData.append('password', document.getElementById('a-password').value);  // admin password

    fetch('/add_admin', { method: 'POST', body: formData })  // send to backend
        .then(res => res.json())                              // parse response
        .then(data => {
            const msg = document.getElementById('admin-msg');  // get message element
            msg.textContent = data.message || data.error;    // show result
            msg.className = data.message ? 'msg' : 'msg error';  // style
            if (data.message) loadAdmins();                  // reload table
        });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMINS — deleteAdmin(id)
// Sends DELETE to /delete_admin/<id>
// Backend will block deleting yourself automatically
// ─────────────────────────────────────────────────────────────────────────────

function deleteAdmin(id) {
    if (!confirm('Delete this admin?')) return;              // confirm first

    fetch(`/delete_admin/${id}`, { method: 'DELETE' })       // send delete request
        .then(res => res.json())                              // parse response
        .then(data => {
            if (data.error) alert(data.error);               // show error if any
            else loadAdmins();                               // reload table
        });
}

// ─────────────────────────────────────────────────────────────────────────────
// ON PAGE LOAD
// When the page first opens, load the products section automatically
// ─────────────────────────────────────────────────────────────────────────────

window.onload = function () {
    loadProducts();                                          // load products on start
};
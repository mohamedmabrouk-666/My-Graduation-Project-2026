// product.js
// Controls the single product details page.
// Reads the product id from the URL, fetches product data from backend,
// and displays name, image, price, description, quantity, and action buttons.

// ─── Get Product ID from URL ──────────────────────────────────────────────────
// The URL looks like: /product?id=5
// We use URLSearchParams to read the id value
const params = new URLSearchParams(window.location.search);  // read URL parameters
const productId = params.get('id');                          // get the id value

// ─── Load Product on Page Start ───────────────────────────────────────────────
window.onload = function () {
    if (!productId) {                                         // no id in URL
        showError();                                          // show error message
        return;
    }
    loadProduct(productId);                                   // fetch and display product
};

// ─── Load Product ─────────────────────────────────────────────────────────────
// Fetches product data from /get_product/<id>
// Builds and injects the full product layout into the page
function loadProduct(id) {
    fetch(`/get_product/${id}`)                               // request product from backend
        .then(res => res.json())                              // parse JSON response
        .then(p => {
            if (p.error) {                                    // product not found
                showError();                                  // show error message
                return;
            }

            // build image path
            const imgSrc = p.image ? `/frontend/images/${p.image}` : '';  // image or empty

            // check if product is in stock
            const stockHTML = p.quantity > 0
                ? `<span>${p.quantity} in stock</span>`       // green quantity
                : `<span class="out-of-stock">Out of stock</span>`;  // red out of stock

            // build the full product HTML
            const container = document.getElementById('product-container');  // get container
            container.innerHTML = `
                <img class="product-image" src="${imgSrc}" alt="${p.name}" onerror="this.style.display='none'">
                <div class="product-details">
                    <p class="category-tag">${p.category || 'Uncategorized'}</p>
                    <h1>${p.name}</h1>
                    <p class="price">${p.price} EGP</p>
                    <p class="description">${p.description || 'No description available.'}</p>
                    <p class="quantity">Available: ${stockHTML}</p>
                    <div class="action-buttons">
                        <a href="/home" class="btn-back">← Back to Home</a>
                        <button class="btn-cart" onclick="addToCart(${p.id})">Add to Cart</button>
                    </div>
                </div>
            `;                                                // inject product layout
        });
}

// ─── Add to Cart ──────────────────────────────────────────────────────────────
// Placeholder for future cart functionality
// Will send the product id to the cart backend later
function addToCart(id) {
    alert('Cart feature coming soon!');                       // placeholder message
}

// ─── Show Error ───────────────────────────────────────────────────────────────
// Shows a message if the product was not found
function showError() {
    document.getElementById('product-container').innerHTML =
        '<p style="padding:40px;color:#999;">Product not found. <a href="/home">Back to Home</a></p>';
}
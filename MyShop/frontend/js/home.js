// home.js
// Controls the home page of MyShop.
// Loads products and categories from the backend.
// Handles search, category filter, and navigation to product details.

// ─── Global Variables ─────────────────────────────────────────────────────────
let allProducts = [];           // stores all products loaded from backend
let activeCategory = 'all';     // tracks the currently selected category filter

// ─── Load Everything on Page Start ───────────────────────────────────────────
window.onload = function () {
    loadCategories();           // load category filter buttons
    loadProducts();             // load all products
};

// ─── Load Categories ──────────────────────────────────────────────────────────
// Fetches all categories from backend and builds filter buttons
// Always adds an "All" button first
function loadCategories() {
    fetch('/get_categories')                                // request categories from backend
        .then(res => res.json())                            // parse JSON response
        .then(cats => {
            const bar = document.getElementById('categories-bar');  // get filter bar
            bar.innerHTML = '';                             // clear old buttons

            // ── All button ────────────────────────────────────────────────────
            const allBtn = document.createElement('button');        // create button
            allBtn.textContent = 'All';                             // button label
            allBtn.className = 'cat-btn active';                    // active by default
            allBtn.onclick = () => filterByCategory('all', allBtn); // click handler
            bar.appendChild(allBtn);                                // add to bar

            // ── One button per category ───────────────────────────────────────
            cats.forEach(cat => {                           // loop through categories
                const btn = document.createElement('button');       // create button
                btn.textContent = cat.name;                         // category name
                btn.className = 'cat-btn';                          // default style
                btn.onclick = () => filterByCategory(cat.name, btn); // click handler
                bar.appendChild(btn);                               // add to bar
            });
        });
}

// ─── Load All Products ────────────────────────────────────────────────────────
// Fetches all products from backend and saves them in allProducts
// Then renders them on screen
function loadProducts() {
    fetch('/get_products')                                  // request products from backend
        .then(res => res.json())                            // parse JSON response
        .then(products => {
            allProducts = products;                         // save all products globally
            renderProducts(products);                       // display them
        });
}

// ─── Render Products ──────────────────────────────────────────────────────────
// Takes an array of products and builds HTML cards for each one
function renderProducts(products) {
    const grid = document.getElementById('products-grid'); // get grid container
    grid.innerHTML = '';                                    // clear old cards

    if (products.length === 0) {                           // no products to show
        grid.innerHTML = '<p class="no-results">No products found.</p>';  // show message
        return;                                            // stop here
    }

    products.forEach(p => {                                // loop through products
        const card = document.createElement('div');        // create card div
        card.className = 'product-card';                   // add card class

        // build image path — use placeholder if no image
        const imgSrc = p.image ? `/frontend/images/${p.image}` : '/frontend/images/placeholder.png';

        card.innerHTML = `
            <img src="${imgSrc}" alt="${p.name}" onerror="this.src=''">
            <div class="card-body">
                <h3>${p.name}</h3>
                <p class="category">${p.category || 'Uncategorized'}</p>
                <p class="price">${p.price} EGP</p>
                <a href="/product?id=${p.id}" class="view-btn">View Product</a>
            </div>
        `;                                                  // fill card with product data

        grid.appendChild(card);                             // add card to grid
    });
}

// ─── Filter By Category ───────────────────────────────────────────────────────
// Called when user clicks a category button
// Filters allProducts array and re-renders only matching products
function filterByCategory(categoryName, clickedBtn) {
    activeCategory = categoryName;                          // update active category

    // update button styles
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active')); // remove active from all
    clickedBtn.classList.add('active');                     // mark clicked button as active

    if (categoryName === 'all') {                           // show all products
        renderProducts(allProducts);                        // render everything
        return;
    }

    // filter products that match the selected category
    const filtered = allProducts.filter(p => p.category === categoryName);  // filter array
    renderProducts(filtered);                               // render filtered list
}

// ─── Search Products ──────────────────────────────────────────────────────────
// Called when user clicks the Search button
// Filters by product name (case insensitive)
function searchProducts() {
    const query = document.getElementById('search-input').value.toLowerCase().trim(); // get search text

    if (!query) {                                           // empty search = show all
        renderProducts(allProducts);                        // render all
        return;
    }

    // filter products whose name includes the search query
    const filtered = allProducts.filter(p => p.name.toLowerCase().includes(query));  // filter
    renderProducts(filtered);                               // render results
}

// ─── Search on Enter Key ──────────────────────────────────────────────────────
// Allows pressing Enter to trigger search instead of clicking the button
document.getElementById('search-input').addEventListener('keyup', function (e) {
    if (e.key === 'Enter') searchProducts();                // trigger search on Enter
});
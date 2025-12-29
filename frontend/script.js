const API_URL = "http://localhost:3000/products";

// Load products on page load
document.addEventListener("DOMContentLoaded", fetchProducts);

function fetchProducts() {
  fetch(API_URL)
    .then(res => res.json())
    .then(products => {
      const table = document.getElementById("productTable");
      table.innerHTML = "";

      products.forEach(product => {
        table.innerHTML += `
          <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.description}</td>
            <td>
              <button onclick="editProduct(${product.id})">Edit</button>
              <button onclick="deleteProduct(${product.id})">Delete</button>
            </td>
          </tr>
        `;
      });
    });
}

function saveProduct() {
  const id = document.getElementById("productId").value;
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const description = document.getElementById("description").value;

  if (!name || !price) {
    alert("Name and price are required");
    return;
  }

  const product = { name, price, description };

  if (id) {
    // UPDATE
    fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    }).then(() => {
      resetForm();
      fetchProducts();
    });
  } else {
    // CREATE
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    }).then(() => {
      resetForm();
      fetchProducts();
    });
  }
}

function editProduct(id) {
  fetch(`${API_URL}/${id}`)
    .then(res => res.json())
    .then(product => {
      document.getElementById("productId").value = product.id;
      document.getElementById("name").value = product.name;
      document.getElementById("price").value = product.price;
      document.getElementById("description").value = product.description;
    });
}

function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  }).then(() => fetchProducts());
}

function resetForm() {
  document.getElementById("productId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("description").value = "";
}

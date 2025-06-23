// admin.js - CRUD completo para Airtable

const TOKEN = 'patHqDf8tsioaqEGA.1977b5eec854ca829b772e8ab69fac180a01a665ab876e75c5968d1feb0553bf';
const BASE_ID = 'app6UpkW3Hi7iNy43';
const TABLE_NAME = 'Products';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

const tbody = document.getElementById('product-tbody');
const form = document.getElementById('add-product-form');

// Leer productos y renderizar
async function fetchProducts() {
  try {
    const res = await fetch(API_URL, { headers });
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    const data = await res.json();

    tbody.innerHTML = '';
    data.records.forEach(product => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${product.fields.Nombre || ''}</td>
        <td>${product.fields.Precio || ''}</td>
        <td>
          <button onclick="editProduct('${product.id}', '${product.fields.Nombre}', ${product.fields.Precio})">Edit</button>
          <button onclick="deleteProduct('${product.id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    alert('Error cargando productos: ' + error.message);
  }
}

// Crear producto
async function createProduct(nombre, precio) {
  try {
    const nuevo = {
      fields: {
        Nombre: nombre,
        Precio: Number(precio)
      }
    };

    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(nuevo)
    });

    if (!res.ok) throw new Error(`Error: ${res.status}`);
    alert('Producto creado con éxito');
    fetchProducts();
  } catch (error) {
    alert('Error creando producto: ' + error.message);
  }
}

// Editar producto
async function editProduct(id, nombreActual, precioActual) {
  const nuevoNombre = prompt('Editar nombre:', nombreActual);
  if (nuevoNombre === null) return;
  const nuevoPrecio = prompt('Editar precio:', precioActual);
  if (nuevoPrecio === null) return;

  try {
    const body = {
      fields: {
        Nombre: nuevoNombre,
        Precio: Number(nuevoPrecio)
      }
    };

    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`Error: ${res.status}`);
    alert('Producto editado con éxito');
    fetchProducts();
  } catch (error) {
    alert('Error editando producto: ' + error.message);
  }
}

// Borrar producto
async function deleteProduct(id) {
  if (!confirm('Confirmás eliminar el producto?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    alert('Producto eliminado con éxito');
    fetchProducts();
  } catch (error) {
    alert('Error eliminando producto: ' + error.message);
  }
}

// Submit del formulario
form.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = document.getElementById('new-name').value.trim();
  const precio = document.getElementById('new-price').value.trim();
  if (!nombre || !precio) return alert('Completá ambos campos.');
  createProduct(nombre, precio);
  form.reset();
});

// Inicializar
fetchProducts();
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

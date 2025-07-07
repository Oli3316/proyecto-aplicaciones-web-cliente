// Protección con contraseña simple (solo para administrador)
(function verificarAcceso() {
  const clave = prompt('Ingrese la contraseña de administrador:');
  if (clave !== 'oli2025') {
    alert('Acceso denegado');
    document.body.innerHTML = '<h2 style="color:white; text-align:center; margin-top: 20%;">Acceso restringido</h2>';
    throw new Error('Acceso denegado');
  }
})();

// Airtable API
const API_TOKEN = 'patXvXv3TJalTDWhl.f7ab8bfed6a7bca37cf25895dd89fc5938e7bed005cbb71d5d8028ca2302c6e7';
const BASE_ID = 'app6UpkW3Hi7iNy43';
const TABLE_NAME = 'Table 2';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
const HEADERS = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json'
};

// DOM
const tbody = document.getElementById('product-tbody');
const form = document.getElementById('add-product-form');
const inputName = document.getElementById('new-name');
const inputPrice = document.getElementById('new-price');

// Mostrar productos
function fetchProducts() {
  fetch(API_URL, { headers: HEADERS })
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = '';
      data.records.forEach(record => {
        const { Name, Price, Description, Image, ["In stock"]: stock } = record.fields;
        const imageUrl = Image && Image.length > 0 ? Image[0].url : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><input type="text" value="${Name || ''}" data-id="${record.id}" class="edit-name" /></td>
          <td><input type="number" value="${Price || ''}" data-id="${record.id}" class="edit-price" /></td>
          <td><input type="text" value="${Description || ''}" data-id="${record.id}" class="edit-desc" /></td>
          <td><input type="number" value="${stock || 0}" data-id="${record.id}" class="edit-stock" /></td>
          <td><input type="text" value="${imageUrl}" data-id="${record.id}" class="edit-image" placeholder="Image URL" /></td>
          <td>
            <button data-id="${record.id}" class="btn-update">Update</button>
            <button data-id="${record.id}" class="btn-delete">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => console.error('Error cargando productos:', err));
}

// Agregar producto
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = inputName.value.trim();
  const price = parseFloat(inputPrice.value.trim());

  if (!name || isNaN(price)) {
    alert('Completa todos los campos correctamente.');
    return;
  }

  const newProduct = {
    fields: {
      Name: name,
      Price: price
    }
  };

  fetch(API_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(newProduct)
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(`Error al agregar producto: ${data.error.message}`);
        console.error(data.error);
        return;
      }
      form.reset();
      fetchProducts();
    })
    .catch(err => console.error('Error al agregar producto:', err));
});

// Delegar eventos de actualización y eliminación
tbody.addEventListener('click', e => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('btn-update')) {
    const name = document.querySelector(`.edit-name[data-id="${id}"]`).value.trim();
    const price = parseFloat(document.querySelector(`.edit-price[data-id="${id}"]`).value.trim());
    const desc = document.querySelector(`.edit-desc[data-id="${id}"]`).value.trim();
    const stock = parseInt(document.querySelector(`.edit-stock[data-id="${id}"]`).value.trim(), 10);
    const imageUrl = document.querySelector(`.edit-image[data-id="${id}"]`).value.trim();

    if (!name || isNaN(price)) {
      alert('Nombre y precio válidos son obligatorios');
      return;
    }

    const updatedProduct = {
      fields: {
        Name: name,
        Price: price,
        Description: desc,
        "In stock": isNaN(stock) ? 0 : stock,
        Image: imageUrl ? [{ url: imageUrl }] : []
      }
    };

    fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify(updatedProduct)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Error al actualizar:', data.error);
          alert(`Error: ${data.error.message}`);
        } else {
          fetchProducts();
        }
      })
      .catch(err => {
        console.error('Error actualizando producto:', err);
        alert('Error inesperado al actualizar');
      });
  }

  if (e.target.classList.contains('btn-delete')) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: HEADERS
      })
        .then(res => {
          if (!res.ok) throw new Error('Error al eliminar');
          fetchProducts();
        })
        .catch(err => {
          console.error('Error eliminando producto:', err);
          alert('No se pudo eliminar el producto.');
        });
    }
  }
});

// Cargar productos al iniciar
document.addEventListener('DOMContentLoaded', fetchProducts);

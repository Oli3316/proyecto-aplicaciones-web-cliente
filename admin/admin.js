//Protección con contraseña simple (sólo para administrador) 
const adminPassword = 'oli2025'; // Cambiá esta contraseña
(function verificarAcceso() {
  const clave = prompt('Ingrese la contraseña de administrador:');
  if (clave !== adminPassword) {
    alert('Acceso denegado');
    document.body.innerHTML = '<h2 style="color:white; text-align:center; margin-top: 20%;">Acceso restringido</h2>';
    throw new Error('Acceso denegado');
  }
})();

//CRUD con API
const TOKEN = 'patHqDf8tsioaqEGA.1977b5eec854ca829b772e8ab69fac180a01a665ab876e75c5968d1feb0553bf';
const BASE_ID = 'app6UpkW3Hi7iNy43';
const TABLE_NAME = 'Products';
//const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;´
const API_URL = 'https://api.airtable.com/v0/app6UpkW3Hi7iNy43/Products'; 

const productTbody = document.getElementById('product-tbody');
const addForm = document.getElementById('add-product-form');
const inputName = document.getElementById('new-name');
const inputPrice = document.getElementById('new-price');

async function fetchProductos() {
  try {
    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const data = await response.json();
    if (data.records) {
      mostrarProductos(data.records);
    } else {
      productTbody.innerHTML = '<tr><td colspan="3">No products found</td></tr>';
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    productTbody.innerHTML = '<tr><td colspan="3">Error loading products</td></tr>';
  }
}

function mostrarProductos(productos) {
  productTbody.innerHTML = '';
  productos.forEach(prod => {
    const tr = document.createElement('tr');
    tr.dataset.id = prod.id;

    tr.innerHTML = `
      <td contenteditable="true" class="editable name">${prod.fields.Nombre || ''}</td>
      <td contenteditable="true" class="editable price">${prod.fields.Precio || ''}</td>
      <td>
        <button class="btn-save">Save</button>
        <button class="btn-delete">Delete</button>
      </td>
    `;

    // Botón borrar
    tr.querySelector('.btn-delete').addEventListener('click', () => borrarProducto(prod.id));

    // Botón guardar cambios
    tr.querySelector('.btn-save').addEventListener('click', () => {
      const nuevoNombre = tr.querySelector('.name').innerText.trim();
      const nuevoPrecio = tr.querySelector('.price').innerText.trim();
      editarProducto(prod.id, nuevoNombre, parseFloat(nuevoPrecio));
    });

    productTbody.appendChild(tr);
  });
}

async function crearProducto(nombre, precio) {
  const nuevoProducto = {
    fields: {
      Nombre: nombre,
      Precio: precio
    }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoProducto)
    });

    if (!response.ok) throw new Error('Error creando producto');

    const data = await response.json();
    console.log('Producto creado:', data);
    fetchProductos(); // refrescar lista
  } catch (error) {
    console.error(error);
    alert('Error al crear producto');
  }
}

async function borrarProducto(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    if (!response.ok) throw new Error('Error borrando producto');
    console.log('Producto borrado:', id);
    fetchProductos();
  } catch (error) {
    console.error(error);
    alert('Error al borrar producto');
  }
}

async function editarProducto(id, nombre, precio) {
  const productoEditado = {
    fields: {
      Nombre: nombre,
      Precio: precio
    }
  };

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productoEditado)
    });

    if (!response.ok) throw new Error('Error editando producto');

    const data = await response.json();
    console.log('Producto editado:', data);
    fetchProductos();
  } catch (error) {
    console.error(error);
    alert('Error al editar producto');
  }
}

// Formulario agregar producto
addForm.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = inputName.value.trim();
  const precio = parseFloat(inputPrice.value);

  if (!nombre || isNaN(precio)) {
    alert('Por favor, ingresa un nombre y un precio válido');
    return;
  }

  crearProducto(nombre, precio);
  addForm.reset();
});

// Cargar productos al iniciar
fetchProductos();
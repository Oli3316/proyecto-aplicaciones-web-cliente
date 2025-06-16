// API
const TOKEN = 'patZoegeZl1MiWxGZ.e427fff4064a5e8ea1339f0ddee6ae0db4f64fb5269450db7308ce17183ded4c';
const BASE_ID = 'app6UpkW3Hi7iNy43';
const TABLE_NAME = 'Products';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

async function crearProducto(nombre, precio) {
  const nuevoProducto = {
    fields: {
      Nombre: nombre,
      Precio: precio
    }
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nuevoProducto)
  });

  const data = await response.json();
  console.log('Producto creado:', data);
}

// Agregar producto al localStorage con cantidad
document.querySelectorAll('.btn-add-products')?.forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.product-section');
    const nombre = card.querySelector('.product-title').textContent;
    const descripcion = card.querySelector('.product-description').textContent;
    const precioTexto = card.querySelector('.product-price').textContent;
    const imagen = card.querySelector('img').src;

    const precioNumerico = parseInt(precioTexto.replace(/\./g, '').replace(/[^0-9]/g, ''), 10);

    const productosGuardados = JSON.parse(localStorage.getItem('productosSeleccionados')) || [];

    // Verificar si ya existe el producto
    const existente = productosGuardados.find(p => p.nombre === nombre);

    if (existente) {
      existente.cantidad += 1;
      existente.precioTotal = existente.precioUnitario * existente.cantidad;
    } else {
      productosGuardados.push({
        nombre,
        descripcion,
        imagen,
        cantidad: 1,
        precioUnitario: precioNumerico,
        precioTotal: precioNumerico
      });
    }

    localStorage.setItem('productosSeleccionados', JSON.stringify(productosGuardados));
    window.location.href = './Shop.html';
  });
});

// Mostrar productos en Shop.html
document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('shop-container');
  const productos = JSON.parse(localStorage.getItem('productosSeleccionados')) || [];

  if (productos.length === 0) {
    contenedor.innerHTML = '<p style="color:white; font-size:1.2rem;">No cars selected.</p>';
    return;
  }

  productos.forEach(producto => {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('product-card');
    tarjeta.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <h2>${producto.nombre}</h2>
      <p>${producto.descripcion}</p>
      <p class="unit-count"><strong>Units:</strong> ${producto.cantidad}</p>
      <p><strong>Total Price:</strong> u$d ${producto.precioTotal.toLocaleString()}</p>
      <button class="confirm-buy">Confirm Purchase</button>
    `;

    tarjeta.querySelector('.confirm-buy').addEventListener('click', () => {
      crearProducto(producto.nombre, producto.precioTotal);
    });

    contenedor.appendChild(tarjeta);
  });
});

// Limpiar carrito
document.getElementById('clear-cart')?.addEventListener('click', () => {
  localStorage.removeItem('productosSeleccionados');
  window.location.reload();
});
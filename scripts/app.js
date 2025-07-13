//API
const TOKEN = 'patXvXv3TJalTDWhl.f7ab8bfed6a7bca37cf25895dd89fc5938e7bed005cbb71d5d8028ca2302c6e7';
const BASE_ID = 'app6UpkW3Hi7iNy43';
const TABLE_NAME = 'Table 2';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

//Función para obtener URL de imagen
function obtenerURLImagen(imagen) {
  if (typeof imagen === 'string') return imagen.trim();
  if (Array.isArray(imagen) && imagen.length > 0 && imagen[0].url) return imagen[0].url;
  return '';
}

//Obtener productos desde Airtable
async function obtenerProductosDesdeAirtable() {
  const response = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  const data = await response.json();
  return data.records || [];
}

//Crear tarjeta de producto
function crearTarjetaProducto(producto, isFromCart = false) {
  if (!producto || !producto.nombre || !producto.precioUnitario) return document.createElement('div');

  const tarjeta = document.createElement('div');
  tarjeta.classList.add('product-card');

  const imagenURL = obtenerURLImagen(producto.imagen);
  if (imagenURL) {
    const img = document.createElement('img');
    img.src = imagenURL;
    img.alt = producto.nombre || 'Product image';
    tarjeta.appendChild(img);
  }

  const h2 = document.createElement('h2');
  h2.textContent = producto.nombre;
  tarjeta.appendChild(h2);

  if (producto.descripcion) {
    const pDesc = document.createElement('p');
    pDesc.textContent = producto.descripcion;
    tarjeta.appendChild(pDesc);
  }

  const pPrecio = document.createElement('p');
  pPrecio.innerHTML = `<strong>Price:</strong> u$d ${(producto.precioTotal || producto.precioUnitario)?.toLocaleString?.() ?? 'N/A'}`;
  tarjeta.appendChild(pPrecio);

  if (isFromCart && producto.cantidad !== undefined) {
    const pCantidad = document.createElement('p');
    pCantidad.classList.add('unit-count');
    pCantidad.innerHTML = `<strong>Units:</strong> ${producto.cantidad}`;
    tarjeta.appendChild(pCantidad);
  }

  if (!isFromCart) {
    const btnBuy = document.createElement('button');
    btnBuy.textContent = 'Buy now';
    btnBuy.classList.add('buy-btn', 'btn-add-products');

    btnBuy.addEventListener('click', () => {
      agregarAlCarrito({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        imagen: imagenURL,
        cantidad: 1,
        precioUnitario: producto.precioUnitario || 0,
        precioTotal: producto.precioUnitario || 0
      });
      alert('Added to cart successfully!');
      window.location.href = './Shop.html';
    });

    tarjeta.appendChild(btnBuy);
  }

  return tarjeta;
}

//Agregar producto al carrito
function agregarAlCarrito(nuevoProducto) {
  const productosGuardados = JSON.parse(localStorage.getItem('productosSeleccionados')) || [];
  const existente = productosGuardados.find(p => p.nombre === nuevoProducto.nombre);

  if (existente) {
    existente.cantidad += 1;
    existente.precioTotal = existente.precioUnitario * existente.cantidad;
  } else {
    productosGuardados.push(nuevoProducto);
  }

  localStorage.setItem('productosSeleccionados', JSON.stringify(productosGuardados));
}

//Mostrar productos en el carrito
function mostrarCarrito() {
  const contenedor = document.getElementById('shop-container');
  if (!contenedor) return;

  const productos = JSON.parse(localStorage.getItem('productosSeleccionados')) || [];
  console.log('🛒 Productos en el carrito:', productos);
  contenedor.innerHTML = '';

  if (productos.length === 0) {
    contenedor.innerHTML = '<p style="color:white; font-size:1.2rem;">No cars selected.</p>';
    return;
  }

  productos.forEach(producto => {
    if (!producto.nombre || !producto.precioUnitario) return;
    const tarjeta = crearTarjetaProducto(producto, true);
    contenedor.appendChild(tarjeta);
  });

  //Calcular total acumulado
  const total = productos.reduce((sum, p) => sum + (p.precioTotal || 0), 0);

  //Contenedor de total + botón confirm
  const summaryContainer = document.createElement('div');
  summaryContainer.classList.add('checkout-summary');

  const pTotal = document.createElement('p');
  pTotal.innerHTML = `<strong>Total:</strong> u$d ${total.toLocaleString()}`;
  summaryContainer.appendChild(pTotal);

  const boton = document.createElement('button');
  boton.textContent = 'Confirm Purchase';
  boton.classList.add('confirm-buy-all');
  boton.addEventListener('click', () => {
    localStorage.setItem('fromCart', 'true');
    localStorage.setItem('selectedProducts', JSON.stringify(productos));
    window.location.href = './contactUs.html';
  });

  summaryContainer.appendChild(boton);
  contenedor.appendChild(summaryContainer);
}

//Sincronizar Airtable con LocalStorage
async function sincronizarProductosAirtableALocalStorage() {
  const airtableProductos = await obtenerProductosDesdeAirtable();
  const productosGuardados = JSON.parse(localStorage.getItem('productosSeleccionados')) || [];

  airtableProductos.forEach(record => {
    const p = record.fields;
    const nombre = p.Nombre;
    const precio = p.Precio;

    if (!nombre || !precio) return;

    if (!productosGuardados.find(prod => prod.nombre === nombre)) {
      productosGuardados.push({
        nombre: nombre,
        descripcion: p.Descripcion || '',
        imagen: obtenerURLImagen(p.Imagen),
        cantidad: 0,
        precioUnitario: precio,
        precioTotal: precio
      });
    }
  });

  localStorage.setItem('productosSeleccionados', JSON.stringify(productosGuardados));
}

//Mostrar productos en Cards.html
async function mostrarProductosParaComprar() {
  const contenedor = document.getElementById('cards-container') || document.body;
  const airtableProductos = await obtenerProductosDesdeAirtable();

  airtableProductos.forEach(record => {
    const p = record.fields;
    const producto = {
      nombre: p.Nombre,
      descripcion: p.Descripcion || '',
      imagen: obtenerURLImagen(p.Imagen),
      precioUnitario: p.Precio || 0,
      precioTotal: p.Precio || 0
    };

    if (!producto.nombre || !producto.precioUnitario) return;

    const tarjeta = crearTarjetaProducto(producto, false);
    contenedor.appendChild(tarjeta);
  });
}

//Al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('shop-container')) {
    await sincronizarProductosAirtableALocalStorage();
    mostrarCarrito();

    const btnClear = document.getElementById('clear-cart');
    btnClear?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.removeItem('productosSeleccionados');
        mostrarCarrito();
      }
    });
  }

  if (document.querySelector('.product-section')) {
    await mostrarProductosParaComprar();

    document.querySelectorAll('.btn-add-products').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.product-section');
        const nombre = card.querySelector('.product-title').textContent;
        const descripcion = card.querySelector('.product-description').textContent;
        const precioTexto = card.querySelector('.product-price').textContent;
        const imagen = card.querySelector('img').src;

        const precioNumerico = parseInt(precioTexto.replace(/\D/g, ''), 10);

        agregarAlCarrito({
          nombre,
          descripcion,
          imagen,
          cantidad: 1,
          precioUnitario: precioNumerico,
          precioTotal: precioNumerico
        });

        alert('Added to cart successfully!');
        window.location.href = './Shop.html';
      });
    });
  }
});

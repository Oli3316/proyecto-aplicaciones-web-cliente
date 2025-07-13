// Airtable API config
const TOKEN = 'patXvXv3TJalTDWhl.f7ab8bfed6a7bca37cf25895dd89fc5938e7bed005cbb71d5d8028ca2302c6e7';
const BASE_ID = 'app6UpkW3Hi7iNy43';
const TABLE_NAME = 'Table 2';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

// Obtener productos desde Airtable
async function obtenerProductosDesdeAirtable() {
  try {
    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    if (!response.ok) throw new Error('Error fetching Airtable data: ' + response.status);
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Crear sección de producto con estilo
function crearSeccionProducto(producto) {
  if (!producto || !producto.nombre) return null;

  const section = document.createElement('section');
  section.classList.add('product-section');
  section.id = producto.nombre.replace(/\s+/g, '');

  const infoDiv = document.createElement('div');
  infoDiv.classList.add('product-info');

  const titulo = document.createElement('h1');
  titulo.classList.add('product-title');
  titulo.textContent = producto.nombre;
  infoDiv.appendChild(titulo);

  const desc = document.createElement('p');
  desc.classList.add('product-description');
  desc.textContent = producto.descripcion || 'No description available.';
  infoDiv.appendChild(desc);

  const precio = document.createElement('p');
  precio.classList.add('product-price');
  if (producto.precioUnitario !== undefined && producto.precioUnitario !== null && producto.precioUnitario !== '') {
    precio.textContent = `Price: u$d ${Number(producto.precioUnitario).toLocaleString()}`;
  } else {
    precio.textContent = 'Price: Not available';
  }
  infoDiv.appendChild(precio);


  const imgDiv = document.createElement('div');
  imgDiv.classList.add('product-image');

  const imagenURL = (typeof producto.imagen === 'string')
    ? producto.imagen.trim()
    : (Array.isArray(producto.imagen) && producto.imagen.length > 0 && producto.imagen[0].url)
      ? producto.imagen[0].url
      : '';

  if (imagenURL !== '') {
    const img = document.createElement('img');
    img.src = imagenURL;
    img.alt = producto.nombre;
    imgDiv.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.style.width = '600px';
    placeholder.style.height = '400px';
    placeholder.style.background = '#222';
    placeholder.style.borderRadius = '15px';
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.color = '#888';
    placeholder.style.fontSize = '1.2rem';
    placeholder.textContent = 'No image available';
    imgDiv.appendChild(placeholder);
  }

  section.appendChild(imgDiv);

   if (producto.precioUnitario && producto.precioUnitario > 0) {
    const btnComprar = document.createElement('button');
    btnComprar.classList.add('buy-btn', 'btn-add-products');
    btnComprar.textContent = 'Buy now';
    btnComprar.addEventListener('click', () => {
      agregarAlCarrito({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        imagen: producto.imagen || '',
        cantidad: 1,
        precioUnitario: producto.precioUnitario,
        precioTotal: producto.precioUnitario
      });
      alert('Added to cart successfully!');
      window.location.href = './Shop.html';
    });
    infoDiv.appendChild(btnComprar);
  }

  section.appendChild(infoDiv);

  return section;
}

// Agregar producto al carrito en localStorage
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

// Renderizar todos los productos
async function cargarProductos() {
  const contenedor = document.getElementById('products-container');
  contenedor.innerHTML = '';

  const records = await obtenerProductosDesdeAirtable();

  if (records.length === 0) {
    const aviso = document.createElement('p');
    aviso.style.color = 'white';
    aviso.style.textAlign = 'center';
    aviso.style.fontSize = '1.5rem';
    aviso.textContent = 'No products found.';
    contenedor.appendChild(aviso);
    return;
  }

  records.forEach(record => {
    const p = record.fields;

    const producto = {
      nombre: p.Name || 'Unnamed product',
      descripcion: p.Description || '',
      precioUnitario: p.Price || 0,
      imagen: p.Image || ''
    };

    const seccion = crearSeccionProducto(producto);
    if (seccion) contenedor.appendChild(seccion);
  });
}


// Inicialización principal al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  initHamburgerMenu();
});

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

//Crear sección de producto con estilo
function crearSeccionProducto(producto) {
  if (!producto || !producto.nombre) return null; //Validamos si es producto o si el producto tiene nombre

  const section = document.createElement('section'); //creamos el section donde se va a mostrar nuestra Card
  section.classList.add('product-section'); //agregamos una clase
  section.id = producto.nombre.replace(/\s+/g, ''); //asigna un Id unico al elemento section, usando el nombre del producto, pero eliminando todos los espacios en blanco.

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
  if (producto.precioUnitario !== undefined && producto.precioUnitario !== null && producto.precioUnitario !== '') { //si el precio es distinto de "undefined, null y no esta vacio", entonces es valido
    precio.textContent = `Price: u$d ${Number(producto.precioUnitario).toLocaleString()}`; //convierte el precio a numero (por si viene como string), toLocaleString le da formado con separadores de miles.
  } else {
    precio.textContent = 'Price: Not available';
  }
  infoDiv.appendChild(precio);


  const imgDiv = document.createElement('div');
  imgDiv.classList.add('product-image');

  const imagenURL = (typeof producto.imagen === 'string') //si viene como string (texto), la limpia con .trim() y la usa.
    ? producto.imagen.trim()
    : (Array.isArray(producto.imagen) && producto.imagen.length > 0 && producto.imagen[0].url) //si viene como array de objetos, toma la url de la primera imagen
      ? producto.imagen[0].url //si no hay imagen deja imagenUrl vacia 
      : '';

  if (imagenURL !== '') { //si imagenUrl no esta vacio, hace lo siguiente
    const img = document.createElement('img'); //creamos la etiqueta img
    img.src = imagenURL; //le asignamos la fuente 
    img.alt = producto.nombre;//le asignamos el texto alternativo con el nombre del producto
    imgDiv.appendChild(img); //se agrega dentro del imgDiv
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
  } //si no hay imagen crea un contenedor que dice "no image available"

  section.appendChild(imgDiv); //agrega el contenedor a la tarjeta del producto

   if (producto.precioUnitario && producto.precioUnitario > 0) { //verifica si el producto tiene precio unitario y es mayor que 0
    const btnComprar = document.createElement('button');
    btnComprar.classList.add('buy-btn', 'btn-add-products');
    btnComprar.textContent = 'Buy now';
    btnComprar.addEventListener('click', () => {
      agregarAlCarrito({ //llamamos a la funcion agregarAlCarrito() con los datos del producto
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
  const productosGuardados = JSON.parse(localStorage.getItem('productosSeleccionados')) || []; //lee el carrito almacenado en localStorage, si no hay nada, crea un array vacio.
  const existente = productosGuardados.find(p => p.nombre === nuevoProducto.nombre); //busca si el producto ya esta en el carrito. 

  if (existente) { //si ya existe aumenta la cantidad y actualiza el total.
    existente.cantidad += 1;
    existente.precioTotal = existente.precioUnitario * existente.cantidad;
  } else {
    productosGuardados.push(nuevoProducto); //si no existe lo agrega al carrito
  }

  localStorage.setItem('productosSeleccionados', JSON.stringify(productosGuardados)); //guardamos el nuevo estado del carrito en el navegador (como Json)
}

// Renderizar todos los productos
  async function cargarProductos() { 
  const contenedor = document.getElementById('products-container'); //busca el contenedor html donde se mostraran los porductos
  contenedor.innerHTML = ''; //limpia su contenido actual

  const records = await obtenerProductosDesdeAirtable(); //llamamos a la funcion que trae los produtos de Airtable

  if (records.length === 0) { //recorre el array, si no encuentra productos ejecuta lo siguiente:
    const aviso = document.createElement('p');
    aviso.style.color = 'white';
    aviso.style.textAlign = 'center';
    aviso.style.fontSize = '1.5rem';
    aviso.textContent = 'No products found.'; //esto va a figurar en caso de no encontrar ningun producto
    contenedor.appendChild(aviso);
    return;
  }

  records.forEach(record => { //recorremos cada registro de airtable
    const p = record.fields; 

    const producto = { //creamos un objeto producto con sus datos
      nombre: p.Name || 'Unnamed product',
      descripcion: p.Description || '',
      precioUnitario: p.Price || 0,
      imagen: p.Image || ''
    };

    const seccion = crearSeccionProducto(producto); //llama a la funcion que esta creando la card
    if (seccion) contenedor.appendChild(seccion); //si se pudo crear correctamente agrega la seccion del producto al contenedor de la pagina
  });
}


// Inicialización principal al cargar la página
document.addEventListener('DOMContentLoaded', () => { //cuando termine de cargar la pagina, se ejecuta la funcion para cargar los productos y para el menu responsive.
  cargarProductos();
  initHamburgerMenu();
});

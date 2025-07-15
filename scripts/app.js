//API
const TOKEN = 'patXvXv3TJalTDWhl.f7ab8bfed6a7bca37cf25895dd89fc5938e7bed005cbb71d5d8028ca2302c6e7';
const BASE_ID = 'app6UpkW3Hi7iNy43';
const TABLE_NAME = 'Table 2';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

//Función para obtener URL de imagen
function obtenerURLImagen(imagen) {
   
  if (typeof imagen === 'string') return imagen.trim();//Si el campo imagen es un string, lo devuelve sin espacios extras
  if (Array.isArray(imagen) && imagen.length > 0 && imagen[0].url) return imagen[0].url;//Verifica si la variable imagen es un array que contiene al menos un elemento, y si ese primer elmento tiene una propiedad .url. Si eso se cumple devuelve la URL
  return '';//Si no cumple ninguna de las condiciones, devuelve un string vacío
}

//Obtener productos desde Airtable (funcion asincronica)
async function obtenerProductosDesdeAirtable() {
  const response = await fetch(API_URL, { //Hace una solicitud GET a la API con el token de autorización en los headers
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  const data = await response.json();//Convierte la respuesta en un objeto JSON
  return data.records || []; //Devuelve los registros obtenidos o un array vacío si no hay datos
}

//Crear tarjeta de producto
function crearTarjetaProducto(producto, isFromCart = false) { //isFromCart verifica si los productos vienen del carrito
  if (!producto || !producto.nombre || !producto.precioUnitario) return document.createElement('div'); //si no viene del carrito o no es valido devuelve un div vacio

  const tarjeta = document.createElement('div'); //Creamos el contenedor de la tarjeta
  tarjeta.classList.add('product-card'); //agregamos clase a ese contenedor

  const imagenURL = obtenerURLImagen(producto.imagen); //obtiene la url de la imagen, y en caso de que exista la agrega a la tarjeta
  if (imagenURL) {
    const img = document.createElement('img');
    img.src = imagenURL;
    img.alt = producto.nombre || 'Product image';
    tarjeta.appendChild(img);
  }

  const h2 = document.createElement('h2'); //agregamos nombre al producto.
  h2.textContent = producto.nombre;
  tarjeta.appendChild(h2);

  if (producto.descripcion) { //Si el producto tiene descripcion se la agregamos al producto. 
    const pDesc = document.createElement('p'); 
    pDesc.textContent = producto.descripcion;
    tarjeta.appendChild(pDesc);
  }

  const pPrecio = document.createElement('p'); //agregamos el precio, usando precioTotal (si viene del carrito) o precioUnitario. precioTotal = unidad * cantidad, precioUnitario = unidad
  pPrecio.innerHTML = `<strong>Price:</strong> u$d ${(producto.precioTotal || producto.precioUnitario)?.toLocaleString?.() ?? 'N/A'}`; //toLocalString convierte los numeros a string 
  tarjeta.appendChild(pPrecio);

  // Si el producto viene del carrito, muestra la cantidad
  if (isFromCart && producto.cantidad !== undefined) {
    const pCantidad = document.createElement('p');
    pCantidad.classList.add('unit-count');
    pCantidad.innerHTML = `<strong>Units:</strong> ${producto.cantidad}`;
    tarjeta.appendChild(pCantidad); //pegamos la cantidad en la tarjeta
  }

    //Si NO viene del carrito el producto, agrega un botón de compra
  if (!isFromCart) {
    const btnBuy = document.createElement('button');
    btnBuy.textContent = 'Buy now';
    btnBuy.classList.add('buy-btn', 'btn-add-products');

    //al hacer click, le agregamos un evento que agrega el producto al carrito y nos redirige al carrito de compras
    btnBuy.addEventListener('click', () => {
      agregarAlCarrito({ //le pasamos los parametros que queremos para mostrar en la tarjeta del carrito (traidos de airtable)
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        imagen: imagenURL,
        cantidad: 1,
        precioUnitario: producto.precioUnitario || 0,
        precioTotal: producto.precioUnitario || 0
      });
      alert('Added to cart successfully!'); //Alert para corroborar que nuestro producto se agrego al carrito
      window.location.href = './Shop.html'; //nos redirije al carrito de compras
    });

    tarjeta.appendChild(btnBuy); //se muestra el boton en la tarjeta
  }

  return tarjeta; //Devuelve la tarjeta
}

//Agregar producto al carrito
function agregarAlCarrito(nuevoProducto) {
  const productosGuardados = JSON.parse(localStorage.getItem('productosSeleccionados')) || []; //Obtiene los productos actuales guardados en el carrito desde localStorage/devuelve un string JSON/.parse lo convierte un array de objetos
  const existente = productosGuardados.find(p => p.nombre === nuevoProducto.nombre); //Busca si ya existe un producto con el mismo nombre

  if (existente) { //Si ya existe, incrementa la cantidad y actualiza el precio total
    existente.cantidad += 1;
    existente.precioTotal = existente.precioUnitario * existente.cantidad;
  } else {
    productosGuardados.push(nuevoProducto);//Si no existe, lo agrega al array
  }

  localStorage.setItem('productosSeleccionados', JSON.stringify(productosGuardados)); //Guarda el nuevo estado del carrito en localStorage
}

//Mostrar productos en el carrito
function mostrarCarrito() {
  const contenedor = document.getElementById('shop-container');
  if (!contenedor) return; //si no existe el contenedor 'shop-container' termina la funcion

  const productos = JSON.parse(localStorage.getItem('productosSeleccionados')) || [];//obtiene los productos guardados en localStorage, o usa array vacío
  console.log('Productos en el carrito:', productos); //mostramos los productos por consola para ver si los esta mostrando 
  contenedor.innerHTML = ''; //limpiamos el contenido anterior del contenedor

  if (productos.length === 0) { //// Si no hay productos, muestra mensaje de carrito vacío
    contenedor.innerHTML = '<p style="color:white; font-size:1.2rem;">No cars selected.</p>';
    return;
  }

  productos.forEach(producto => { 
    if (!producto.nombre || !producto.precioUnitario) return;//verificamos que el producto sea valido
    const tarjeta = crearTarjetaProducto(producto, true);//Crea una tarjeta del producto con `isFromCart = true`
    contenedor.appendChild(tarjeta);//agregamos la tarjeta al contenedor
  });

  //Calculamos el total acumulado. Con .reduce resumimos todo a un solo valor, se usa para sumar elementos de un array.
  const total = productos.reduce((sum, p) => sum + (p.precioTotal || 0), 0);

  //Creamos contenedor para mostrar total y botón de confirmación
  const summaryContainer = document.createElement('div');
  summaryContainer.classList.add('checkout-summary'); //agregamos una clase para estilos

  const pTotal = document.createElement('p');
  pTotal.innerHTML = `<strong>Total:</strong> u$d ${total.toLocaleString()}`;
  summaryContainer.appendChild(pTotal);

  const boton = document.createElement('button');
  boton.textContent = 'Confirm Purchase'; //texto del boton
  boton.classList.add('confirm-buy-all'); //agregamos clase al boton
  boton.addEventListener('click', () => { //le pasamos un evento al boton
    localStorage.setItem('fromCart', 'true'); //verificamos que la compra venga del carrito de compras
    localStorage.setItem('selectedProducts', JSON.stringify(productos)); //guardamos el producto seleccionado en el localStorage
    window.location.href = './contactUs.html'; //redirijimos a la seccion de contacto para realizar la compra
  });

  summaryContainer.appendChild(boton); //agregamos el boton al resumen
  contenedor.appendChild(summaryContainer);//agregamos el resumen al contenedor
}

//Sincronizar Airtable con LocalStorage
async function sincronizarProductosAirtableALocalStorage() {
  const airtableProductos = await obtenerProductosDesdeAirtable();
  const productosGuardados = JSON.parse(localStorage.getItem('productosSeleccionados')) || [];

  airtableProductos.forEach(record => {
    const p = record.fields; //Accede a los campos del registro
    const nombre = p.Nombre;
    const precio = p.Precio;

    if (!nombre || !precio) return; //Si faltan datos, salta al siguiente

    //Si el producto aún no está en el carrito, lo agrega
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

  localStorage.setItem('productosSeleccionados', JSON.stringify(productosGuardados));//Guardamos la lista sincronizada en localStorage
}

//Mostrar productos en Cards.html
async function mostrarProductosParaComprar() {
  const contenedor = document.getElementById('cards-container') || document.body; //toma el contenedor o usa el body
  const airtableProductos = await obtenerProductosDesdeAirtable(); //Trae productos desde Airtable

  //Crea el objeto producto con los campos necesarios
  airtableProductos.forEach(record => {
    const p = record.fields;
    const producto = {
      nombre: p.Nombre,
      descripcion: p.Descripcion || '',
      imagen: obtenerURLImagen(p.Imagen),
      precioUnitario: p.Precio || 0,
      precioTotal: p.Precio || 0
    };

    if (!producto.nombre || !producto.precioUnitario) return; //Verifica que tenga nombre y precio

    const tarjeta = crearTarjetaProducto(producto, false);//Crea la tarjeta del producto con isFromCart = false, es decir que no va a venir desde el carrito
    contenedor.appendChild(tarjeta);//agregamos la tarjeta al contenedor
  });
}

//Ejecuta funciones al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('shop-container')) {
    await sincronizarProductosAirtableALocalStorage();
    mostrarCarrito(); //mostramos el carrito

    //con este boton vaciamos el carrito
    const btnClear = document.getElementById('clear-cart'); 
    btnClear?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.removeItem('productosSeleccionados');
        mostrarCarrito();
      }
    });
  }

  if (document.querySelector('.product-section')) { //validamos si esta el catalogo en la seccion
    await mostrarProductosParaComprar(); //mostramos los productos disponibles

    //Agrega evento a cada botón de agregar producto
    document.querySelectorAll('.btn-add-products').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.product-section'); //busca el padre más cercano del botón que tenga dicha clase
        const nombre = card.querySelector('.product-title').textContent;
        const descripcion = card.querySelector('.product-description').textContent;
        const precioTexto = card.querySelector('.product-price').textContent;
        const imagen = card.querySelector('img').src;

        //Extrae solo los números del precio (remueve letras, símbolos)
        const precioNumerico = parseInt(precioTexto.replace(/\D/g, ''), 10);

        //Agrega el producto al carrito
        agregarAlCarrito({
          nombre,
          descripcion,
          imagen,
          cantidad: 1,
          precioUnitario: precioNumerico,
          precioTotal: precioNumerico
        });

        alert('Added to cart successfully!'); //Mensaje de confirmación
        window.location.href = './Shop.html';//Redirige al carrito
      });
    });
  }
});

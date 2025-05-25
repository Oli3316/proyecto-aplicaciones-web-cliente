//llamada a la API
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
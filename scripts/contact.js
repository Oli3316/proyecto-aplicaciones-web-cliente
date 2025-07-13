//Airtable 
const TOKEN = 'patAvXqrGTMUV4Cs5.7ec7d8e53fb87718cd6c579f8381b4d718068744d61786e879edc1700a96b25a';
const BASE_ID = 'app6UpkW3Hi7iNy43';
const TABLE_NAME = 'Registros';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

//FORMULARIO DE REGISTRO
//Conectamos con el formulario de registro y los mensajes de exito o error
const registerForm = document.getElementById('register-form');
const successMsg = document.getElementById('register-success');
const errorMsg = document.getElementById('register-error');

//Función para hashear contraseña (SHA-256)
async function hashPassword(password) {
  const encoder = new TextEncoder(); //Convierte el texto a un formato especial
  const data = encoder.encode(password); //Codifica la contraseña
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);//Aplica el hash
  const hashArray = Array.from(new Uint8Array(hashBuffer));//Convertimos el hash en un array de numeros
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); //Lo convertimos a texto hexadecimal
  return hashHex;//devuelve la contraseña codificada
}

//Función para guardar cookie 
function setEmailCookie(email) {
  const days = 7;
  const maxAge = days * 24 * 60 * 60; //lo convertimos a segundos
  document.cookie = `userEmail=${encodeURIComponent(email)}; max-age=${maxAge}; path=/`; //creamos la cookie
}

//Evento de envío del formulario de registro
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  //Capturar datos
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  //Validación básica
  if (!name || !email || !password) {
    errorMsg.textContent = 'Please fill in all fields.';
    successMsg.textContent = '';
    return;
  }

  try {
    //Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    //Enviar a Airtable
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Name: name,
          Email: email,
          Password: hashedPassword,
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
  // Crear cookie con el email
  setEmailCookie(email);


  // Obtener productos del carrito
  const productos = window.emailService.obtenerProductosCarrito();
  const total = window.emailService.calcularTotal(productos);

  let resumen = '';
  if (productos.length > 0) {
    //Crear resumen para mostrar
    resumen = productos.map(p => `${p.nombre} (${p.cantidad}) - $${p.precioTotal}`).join('\n');
  }

  // Enviar email
  const emailEnviado = await window.emailService.enviarEmailConfirmacion(name, email, productos, total);
  
  if (emailEnviado) {
    successMsg.innerHTML = `
      Registered successfully! Confirmation email sent.<br>
      <strong>Purchase summary:</strong><br>
      ${resumen.replace(/\n/g, '<br>')}<br>
      <strong>Total: u$d ${total}</strong>
    `;
  } else {
    successMsg.innerHTML = `
      Registered successfully!<br>
    `;
  }

  errorMsg.textContent = '';
  registerForm.reset();

  // Limpiar carrito
  localStorage.removeItem('productosSeleccionados');
  localStorage.removeItem('fromCart');
  localStorage.removeItem('selectedProducts');
} else {
      throw new Error(data.error?.message || 'Error submitting form.');
    }
  } catch (err) {
    errorMsg.textContent = `Error: ${err.message}`;
    successMsg.textContent = '';
  }
});

// FORMULARIO DE CONTACTO (VERIFICACIÓN DE REGISTRO Y ENVÍO DE EMAIL CON CITA)

const contactForm = document.getElementById('contact-form');
const contactError = document.getElementById('form-error');
const contactSuccess = document.getElementById('form-success');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    contactError.textContent = 'Please fill in all fields.';
    contactSuccess.textContent = '';
    return;
  }

  try {
    const response = await fetch(`${API_URL}?filterByFormula=LOWER({Email})='${email.toLowerCase()}'`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });

    const data = await response.json();

    if (data.records && data.records.length > 0) {
      // Usuario registrado - Obtener productos del carrito y enviar email de cita
      const productos = window.emailService.obtenerProductosCarrito();
      const total = window.emailService.calcularTotal(productos);
      
      const emailEnviado = await window.emailService.enviarEmailCita(name, email, message, productos, total);
      
      if (emailEnviado) {
        contactSuccess.textContent = 'Appointment scheduled successfully! Check your email for confirmation.';
        contactForm.reset();
        // Limpiar carrito después de agendar la cita
        localStorage.removeItem('productosSeleccionados');
        localStorage.removeItem('fromCart');
        localStorage.removeItem('selectedProducts');
      } else {
        contactSuccess.textContent = 'Appointment received but email could not be sent.';
      }
      
      contactError.textContent = '';
      
    } else {
      // Usuario no registrado
      contactError.textContent = 'You are not registered. Please register below first.';
      contactSuccess.textContent = '';

      const registerSection = document.getElementById('register-form');
      registerSection.scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    contactError.textContent = `Error: ${err.message}`;
    contactSuccess.textContent = '';
  }
});
//Airtable 
const TOKEN = 'patAvXqrGTMUV4Cs5.7ec7d8e53fb87718cd6c579f8381b4d718068744d61786e879edc1700a96b25a';
const BASE_ID = 'app6UpkW3Hi7iNy43';
const TABLE_NAME = 'Registros';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

//FORMULARIO DE REGISTRO

const registerForm = document.getElementById('register-form');
const successMsg = document.getElementById('register-success');
const errorMsg = document.getElementById('register-error');

// Función para hashear contraseña (SHA-256)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

//Función para guardar cookie (email del usuario por 7 días)
function setEmailCookie(email) {
  const days = 7;
  const maxAge = days * 24 * 60 * 60; //segundos
  document.cookie = `userEmail=${encodeURIComponent(email)}; max-age=${maxAge}; path=/`;
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
      //Crear cookie con el email
      setEmailCookie(email);

      //Enviar email automático
      try {
        //Obtener productos del carrito
        const productos = window.emailService.obtenerProductosCarrito();
        const total = window.emailService.calcularTotal(productos);

        if (productos.length > 0) {
          //Enviar email de confirmación
          const emailEnviado = await window.emailService.enviarEmailConfirmacion(name, email, productos, total);
          
          if (emailEnviado) {
            successMsg.textContent = 'Registered successfully! Confirmation email sent.';
            console.log('📧 Email de confirmación enviado a:', email);
          } else {
            successMsg.textContent = 'Registered successfully! (Email could not be sent)';
            console.log('⚠️ Registro exitoso pero email no pudo ser enviado');
          }
        } else {
          successMsg.textContent = 'Registered successfully!';
          console.log('ℹ️ Registro exitoso sin productos en carrito');
        }
      } catch (emailError) {
        console.error('Error en servicio de email:', emailError);
        successMsg.textContent = 'Registered successfully! (Email service error)';
      }

      errorMsg.textContent = '';
      registerForm.reset();
      
      //Limpiar carrito después del registro exitoso
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

// FORMULARIO DE CONTACTO (VERIFICACIÓN DE REGISTRO)

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
      //Usuario registrado
      contactSuccess.textContent = 'User found. Message ready to be sent!';
      contactError.textContent = '';
      contactForm.reset();
      
      //Aquí podrías enviar el mensaje de contacto también por email si lo deseas
      console.log('Mensaje de contacto de usuario registrado:', { name, email, message });
      
    } else {
      // Usuario no registrado (Mostrar mensaje y hacer scroll al formulario de registro)
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
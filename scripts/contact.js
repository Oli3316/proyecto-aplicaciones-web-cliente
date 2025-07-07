// Airtable config
const TOKEN = 'patAvXqrGTMUV4Cs5.7ec7d8e53fb87718cd6c579f8381b4d718068744d61786e879edc1700a96b25a';
const BASE_ID = 'app6UpkW3Hi7iNy43';
const TABLE_NAME = 'Registros';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

// Formulario y mensajes
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

// Evento de envío del formulario
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Capturar datos
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  // Validación básica
  if (!name || !email || !password) {
    errorMsg.textContent = 'Please fill in all fields.';
    successMsg.textContent = '';
    return;
  }

  try {
    // Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    // Enviar a Airtable
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
      successMsg.textContent = 'Registered successfully!';
      errorMsg.textContent = '';
      registerForm.reset();
    } else {
      throw new Error(data.error?.message || 'Error submitting form.');
    }
  } catch (err) {
    errorMsg.textContent = `Error: ${err.message}`;
    successMsg.textContent = '';
  }
});



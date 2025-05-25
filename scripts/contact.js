//Validar de formulario
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const error = document.getElementById('form-error');
  const exito = document.getElementById('form-success');

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    error.textContent = '';
    exito.textContent = '';

    const nombre = document.getElementById('name').value.trim();
    const correo = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('message').value.trim();

    if (!nombre || !correo || !mensaje) {
      error.textContent = 'Todos los campos son obligatorios.';
      return;
    }

    exito.textContent = 'Mensaje guardado correctamente.';
    form.reset();
  });
});
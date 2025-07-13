// Inicializar EmailJS
emailjs.init('TYnVMGqQ5PkYQbMih'); // public key

// Objeto global para usar en contact.js
window.emailService = {
  // Obtener productos del carrito
  obtenerProductosCarrito: function () {
    const productos = JSON.parse(localStorage.getItem('productosSeleccionados')) || [];
    return productos;
  },

  // Calcular total
  calcularTotal: function (productos) {
    return productos.reduce((sum, p) => sum + (p.precioTotal || 0), 0);
  },

  // Enviar email de confirmación de compra
  enviarEmailConfirmacion: async function (nombre, email, productos, total) {
    if (!productos.length || !email) return false;

    // Armar contenido del resumen de compra
    const resumen = productos.map(p => `${p.nombre} (${p.cantidad}) - u$d ${p.precioTotal}`).join('\n');

    const templateParams = {
      to_name: nombre,
      to_email: email,
      message: `Thanks for your purchase!\n\nYour order:\n${resumen}\n\nTotal: u$d ${total}`
    };

    try {
      const response = await emailjs.send(
        'service_ifb51kh',   // Tu service ID
        'template_iciw0tq',  // Tu template ID
        templateParams
      );

      console.log('Email enviado:', response);
      return true;
    } catch (error) {
      console.error('Error al enviar email:', error);
      return false;
    }
  },

  // NUEVA FUNCIÓN: Enviar email de cita con resumen de compra
  enviarEmailCita: async function (nombre, email, mensaje, productos, total) {
    if (!email || !mensaje) return false;

    // Crear resumen de productos
    let resumenCompra = '';
    if (productos.length > 0) {
      resumenCompra = productos.map(p => `• ${p.nombre} (Quantity: ${p.cantidad}) - u$d ${p.precioTotal}`).join('\n');
    } else {
      resumenCompra = 'No products in cart';
    }

    const templateParams = {
      to_name: nombre,
      to_email: email,
      from_name: nombre,
      from_email: email,
      subject: 'Appointment Confirmation - Baker\'s Cars',
      message: `APPOINTMENT CONFIRMATION\n\nDear ${nombre},\n\nYour appointment has been scheduled successfully!\n\n--- APPOINTMENT DETAILS ---\nYour message: "${mensaje}"\n\n--- PURCHASE SUMMARY ---\n${resumenCompra}\n\nTOTAL: u$d ${total}\n\n--- NEXT STEPS ---\nOur team will contact you shortly to confirm the appointment date and time.\nPlease have your payment ready for the total amount.\n\nThank you for choosing Baker's Cars!\n\nBest regards,\nBaker's Cars Team\n\n---\nThis is an automated confirmation. Please do not reply to this email.`
    };

    try {
      const response = await emailjs.send(
        'service_ifb51kh',   // Tu service ID
        'template_iciw0tq',  // Tu template ID
        templateParams
      );

      console.log('Email de cita enviado:', response);
      return true;
    } catch (error) {
      console.error('Error al enviar email de cita:', error);
      return false;
    }
  },

  // Función original de contacto (mantener por si la necesitas)
  enviarEmailContacto: async function (nombre, email, mensaje) {
    if (!email || !mensaje) return false;

    const templateParams = {
      to_name: nombre,
      to_email: email,
      from_name: nombre,
      from_email: email,
      message: mensaje,
      reply_message: `Hi ${nombre},\n\nThank you for contacting us! We have received your message:\n\n"${mensaje}"\n\nOur team will get back to you shortly.\n\nBest regards,\nBaker's Cars Team`
    };

    try {
      const response = await emailjs.send(
        'service_ifb51kh',   // Tu service ID
        'template_iciw0tq',  // Tu template ID (o crea uno nuevo específico para contacto)
        templateParams
      );

      console.log('Email de contacto enviado:', response);
      return true;
    } catch (error) {
      console.error('Error al enviar email de contacto:', error);
      return false;
    }
  }
};
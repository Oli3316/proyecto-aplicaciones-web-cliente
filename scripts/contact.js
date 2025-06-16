// Contact Js

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form");
  const registerForm = document.getElementById("register-form");
  const purchaseButtons = document.querySelectorAll(".confirm-buy");

  // Funciones para manejar usuarios registrados en localStorage
  function getRegisteredUsers() {
    return JSON.parse(localStorage.getItem("registeredUsers")) || [];
  }

  function registerUser(email) {
    let users = getRegisteredUsers();
    if (!users.includes(email)) {
      users.push(email);
      localStorage.setItem("registeredUsers", JSON.stringify(users));
    }
    localStorage.setItem("currentUserEmail", email); // Guarda el usuario actual
  }

  function isUserRegistered(email) {
    let users = getRegisteredUsers();
    return users.includes(email);
  }

  // Formulario de contacto
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();
      const error = document.getElementById("form-error");
      const success = document.getElementById("form-success");

      if (!name || !email || !message) {
        error.textContent = "All fields are required.";
        success.textContent = "";
        error.scrollIntoView({ behavior: "smooth" });
        return;
      }

      if (!isUserRegistered(email)) {
        error.textContent = "Email not registered. Please register before sending a message.";
        success.textContent = "";
        const registerSection = document.getElementById("register-form");
        if (registerSection) {
          registerSection.scrollIntoView({ behavior: "smooth" });
        } else {
          error.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }

      // Simulación de envío de mensaje
      success.textContent = "Message sent successfully!";
      error.textContent = "";
      contactForm.reset();
    });
  }

  // Formulario de registro
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value;
      const error = document.getElementById("register-error");
      const success = document.getElementById("register-success");

      if (!name || !email || !password) {
        error.textContent = "All fields are required.";
        success.textContent = "";
        error.scrollIntoView({ behavior: "smooth" });
        return;
      }

      if (password.length < 6) {
        error.textContent = "Password must be at least 6 characters.";
        success.textContent = "";
        error.scrollIntoView({ behavior: "smooth" });
        return;
      }

      registerUser(email); // Guarda usuario y lo marca como actual
      success.textContent = "Registration successful! You can now complete your purchase.";
      error.textContent = "";
      registerForm.reset();
    });
  }

  // Protección para intentos de compra sin estar registrado
  if (purchaseButtons.length) {
    purchaseButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const userEmail = localStorage.getItem("currentUserEmail");
        if (!userEmail || !isUserRegistered(userEmail)) {
          alert("Please register before making a purchase.");
          window.location.href = "./contactUs.html#register-form";
        }
      });
    });
  }
});

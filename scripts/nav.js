//Boton Hamburguesa
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");  //con toggle agrega la clase (en caso de no tenerla), y sino la quita
    navLinks.classList.toggle("active");
    console.log("hamburger click"); //imprimimos para ver que el evento este funcionando
  });
});

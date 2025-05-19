const productos = [
    {
        name: "Cybertruck",
        description: "A bold, angular electric pickup truck built with ultra-hard stainless steel.",
        image: "./img/card/cybertruck.jpg",
        price: 125000,
        available: 8
    },
    {
        name: "Model S",
        description: "A luxury all-electric sedan offering impressive range and supercar-like acceleration.",
        image: "./img/card/ModelS.jpg",
        price: 35000,
        available: 12
    },
    {
        name: "Model 3",
        description: "A sleek, compact sedan known for its affordability and efficiency.",
        image: "./img/card/Model3.jpg",
        price: 55000,
        available: 15
    },
    {
        name: "Model X",
        description: "A full-size electric SUV featuring falcon-wing rear doors and spacious seating.",
        image: "./img/card/ModelX.jpg",
        price: 23000,
        available: 19
    },
    {
        name: "Model Y",
        description: "A compact crossover SUV with ample cargo space and great range.",
        image: "./img/card/ModelY.jpg",
        price: 47000,
        available: 6
    }
];

const grid = document.querySelector('.product-grid');

function createProductCard(product) {
    const card = document.createElement('article');
    card.classList.add('product-card');

    const img = document.createElement('img');
    img.src = product.image || './img/card/default.jpg';
    img.alt = product.name;

    const title = document.createElement('h3');
    title.classList.add('product-title');
    title.textContent = product.name;

    const description = document.createElement('p');
    description.classList.add('product-description');
    description.textContent = product.description;

    const price = document.createElement('p');
    price.classList.add('product-price');
    price.textContent = typeof product.price === 'number' ? `$${product.price.toLocaleString()}` : product.price;

    const button = document.createElement('button');
    button.classList.add('buy-btn');
    button.textContent = 'Buy Now';

    // Evento: Al hacer clic en Buy Now

    function add (product) {
        button.addEventListener('click', () => {
             // Oculta todas las demás cartas
            document.querySelectorAll('.product-card').forEach(c => c.style.display = 'none');

            // Muestra solo esta
            card.style.display = 'flex';
    });
    }

    add ();
   

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(price);
    card.appendChild(button);

    return card;
}

productos.forEach(product => {
    const card = createProductCard(product);
    grid.appendChild(card);
});



const fruits = ["orange", "kiwi", "banane"];
let counters = {};
let elements = {};
let messageFinal = "";

const valid = document.getElementById('valid');
const affichageAnswer = document.getElementById('answer');
const affichageStock = document.getElementById('stock');

// Initialiser stock depuis localStorage
const stock = JSON.parse(localStorage.getItem("stock")) || {};
fruits.forEach(fruit => {
  if (!stock[fruit]) stock[fruit] = 0;
});

// Initialisation des compteurs et éléments
fruits.forEach(fruit => {
  counters[fruit] = 0;
  elements[fruit] = {
    plusBtn: document.getElementById(`plus-${fruit}`),
    minusBtn: document.getElementById(`minus-${fruit}`),
    display: document.getElementById(`compteur-${fruit}`),
  };

  elements[fruit].plusBtn.addEventListener('click', () => {
    counters[fruit]++;
    updateDisplay(fruit);
  });

  // − bouton
  elements[fruit].minusBtn.addEventListener('click', () => {
    if (counters[fruit] > 0) {
      counters[fruit]--;
      updateDisplay(fruit);
    }
  });

  updateDisplay(fruit);
});

// Met à jour l'affichage du compteur
function updateDisplay(fruit) {
  elements[fruit].display.textContent = `${capitalize(fruit)} : ${counters[fruit]}`;
}

// Achète un fruit
function buyFruit(fruit) {
  const qty = counters[fruit];

  if (qty === 0) return "";

  if (qty > stock[fruit]) {
    return `Pas assez de stock, il reste ${stock[fruit]} ${fruit}s. `;
  }

  stock[fruit] -= qty;
  counters[fruit] = 0;
  updateDisplay(fruit);
  return `Vous avez acheté ${qty} ${fruit}${qty > 1 ? "s" : ""}. `;
}

// Sauvegarde dans localStorage
function sauvegarderStock() {
  localStorage.setItem("stock", JSON.stringify(stock));
}

// Affiche le stock à l’écran
function afficherStock() {
  affichageStock.textContent = fruits
    .map(fruit => `${capitalize(fruit)}s : ${stock[fruit]}`)
    .join(" | ");
}

// Capitaliser le nom du fruit
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Quand on clique sur "Acheter"
valid.addEventListener('click', () => {
  messageFinal = "";

  if (fruits.every(fruit => counters[fruit] === 0)) {
    affichageAnswer.textContent = "Sélectionnez vos fruits";
    return;
  }

  fruits.forEach(fruit => {
    messageFinal += buyFruit(fruit);
  });

  sauvegarderStock();
  afficherStock();
  affichageAnswer.textContent = messageFinal;
});

afficherStock();
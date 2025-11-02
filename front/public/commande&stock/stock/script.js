let elements = {};
let counters = {};
const fruits = ["orange", "kiwi", "banane"];

const valid = document.getElementById('valid');

const stock = JSON.parse(localStorage.getItem("stock")) || {};
  fruits.forEach(fruit => {
    if (!stock[fruit]) {stock[fruit] = 0}
});

fruits.forEach(fruit => {
  counters[fruit] = 0;
  elements[fruit] = {
  plusBtn: document.getElementById(`plus-${fruit}`),
  minusBtn: document.getElementById(`minus-${fruit}`),
  display: document.getElementById(`compteur-${fruit}`),
  stock: document.getElementById(`stock-${fruit}`)
};
  elements[fruit].plusBtn.addEventListener('click', () => {
    counters[fruit]++;
    updateDisplay(fruit);
  })
  elements[fruit].minusBtn.addEventListener('click', () => {
    if (counters[fruit] > 0) {
      counters[fruit]--;
      updateDisplay(fruit);
    }
  })
  updateDisplay(fruit);
});

function updateDisplay(fruit) {
  elements[fruit].display.textContent = `${capitalize(fruit)} : ${counters[fruit]}`;
  elements[fruit].stock.textContent = `${capitalize(fruit)} : ${stock[fruit]}`;
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function saveStock() {
  localStorage.setItem('stock', JSON.stringify(stock))
}

function updateStock() {
  fruits.forEach(fruit => {
    if (counters[fruit] > 0) {
      stock[fruit] += counters[fruit];
      counters[fruit] = 0;
      updateDisplay(fruit);
      saveStock();
    }
  })
}

valid.addEventListener('click', () => {
  updateStock()
});

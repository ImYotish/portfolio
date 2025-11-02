let size = document.querySelector('#grid-size');
const container = document.querySelector('#grid-container');
const randomColor = document.querySelector('#random-colors')
const darkColor = document.querySelector('#dark-colors')
const reset = document.querySelector('#reset')
const unlimitedMode = document.querySelector('#unlimited')


function generateColor () {
    const color = Math.floor(Math.random() * 360);
    return color;
}

function generateDarkColor () {
    const color = Math.floor(Math.random() * 360);
    return `hsl(${color}, 50%, 20%)`;
}

const darkenMode = document.querySelector('#darkenMode');

function generateGrid(size) {
  container.innerHTML = '';
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    cell.style.width = `${100 / size}%`;
    cell.style.height = `${90 / size}vh`;
    let caseOn = false
    let sum = 50;
    const color = generateColor();

    if (unlimitedMode.checked) {
      cell.addEventListener('mouseover', () => {
          let couleur = cell.dataset.opacity;
          if (!darkColor.checked) {
              couleur = randomColor.checked ? `${color}, 50%` : `0, 0%`;
              cell.dataset.opacity = couleur;
              cell.style.background = `hsl(${couleur}, 50%)`;
          }
          if (darkColor.checked) {
            let currentDark = parseInt(cell.dataset.darkness || sum);
            currentDark = Math.max(currentDark - 10, 0);
            cell.dataset.darkness = currentDark;
            cell.style.background = `hsl(0, 0%, ${currentDark}%)`;
          }
      });
    } else {
      cell.addEventListener('mouseover', () => {
        let couleur = cell.dataset.opacity;
        if (!caseOn) {
            couleur = randomColor.checked ? `${color}, 50%` : `0, 0%`;
            cell.dataset.opacity = couleur;
            cell.style.background = `hsl(${couleur}, ${sum}%)`;

            caseOn = true;
        }
        if (caseOn && darkColor.checked) {
            sum = Math.max(sum - 10, 0);
            cell.style.background = `hsl(${couleur}, ${sum}%)`;
        }
      });
    }

    container.appendChild(cell);
  }
}


function getCurrentSize() {
  return parseInt(size.value, 10) || 1;
}

size.addEventListener('change', () => {
  generateGrid(getCurrentSize());
});

reset.addEventListener('click', () => {
  generateGrid(getCurrentSize());
});

unlimitedMode.addEventListener('change', () => {
  generateGrid(getCurrentSize())
})

generateGrid(getCurrentSize());
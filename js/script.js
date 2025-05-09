// Загружаем данные один раз
let allWords = [];

fetch("data/words.json")
  .then(res => res.json())
  .then(data => {
    allWords = data;
    renderAll();
    handleHash(); // если открыт #слово
  });

window.addEventListener("hashchange", handleHash);

// 🧠 Обработка хэша (например, #cap)
function handleHash() {
  const key = decodeURIComponent(location.hash.slice(1));
  if (!key) return renderAll();

  const word = allWords.find(w => w.key === key);
  if (word) {
    displayWord(word);
  } else {
    showNotFound(key);
  }
}

// 🧾 Показ одного слова
function displayWord(word) {
  const container = document.querySelector(".main");
  container.innerHTML = `
    <div class="card large">
      <h2>${word.term}</h2>
      <p>${word.definition}</p>
      <a class="more-link" href="#">← Назад к списку</a>
    </div>
  `;
}

// 🚫 Слово не найдено
function showNotFound(term) {
  const container = document.querySelector(".main");
  container.innerHTML = `
    <div class="error">
      <h2>Слово «${term}» не найдено</h2>
      <p>Проверьте написание или <a href="#">вернитесь на главную</a>.</p>
    </div>
  `;
}

// 📚 Отрисовать все слова
function renderAll(category = "all") {
  const container = document.querySelector(".main");
  const filtered = category === "all"
    ? allWords
    : allWords.filter(w => w.category === category);

  container.innerHTML = filtered.map(word => `
    <div class="card small">
      <p class="card-label">${word.category}</p>
      <h2 class="word-title">${word.term}</h2>
      <p class="definition">${word.definition}</p>
      <a class="more-link" href="#${word.key}">Подробнее</a>
    </div>
  `).join("");
}

// 🗂 Обработка категорий
document.querySelectorAll("#categoryOptions button").forEach(btn => {
  btn.addEventListener("click", () => {
    const value = btn.value;
    renderAll(value);
  });
});

// 🔍 Подсказки по поиску
const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-button");

searchInput.addEventListener("input", () => {
  const term = searchInput.value.trim().toLowerCase();
  if (term.length < 2) return removeSuggestions();

  const suggestions = allWords
    .filter(w => w.term.toLowerCase().includes(term))
    .slice(0, 5);

  showSuggestions(suggestions);
});

searchButton.addEventListener("click", () => {
  const term = searchInput.value.trim().toLowerCase();
  const match = allWords.find(w => w.term.toLowerCase() === term);
  if (match) {
    location.hash = `#${match.key}`;
  } else {
    showNotFound(term);
  }
});

// 💬 Подсказки HTML
function showSuggestions(words) {
  removeSuggestions();

  const list = document.createElement("div");
  list.className = "suggestions";
  list.style.position = "absolute";
  list.style.top = "100%";
  list.style.left = "0";
  list.style.right = "0";
  list.style.background = "white";
  list.style.border = "1px solid #ccc";
  list.style.borderRadius = "8px";
  list.style.zIndex = "10";
  list.style.maxHeight = "200px";
  list.style.overflowY = "auto";

  words.forEach(word => {
    const item = document.createElement("div");
    item.textContent = word.term;
    item.style.padding = "10px 16px";
    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      searchInput.value = word.term;
      location.hash = `#${word.key}`;
      removeSuggestions();
    });
    list.appendChild(item);
  });

  document.querySelector(".search-input-wrapper").appendChild(list);
}

function removeSuggestions() {
  const existing = document.querySelector(".suggestions");
  if (existing) existing.remove();
}

let allWords = [];

// Загрузка JSON и инициализация
fetch("data/words.json")
  .then(res => res.json())
  .then(data => {
    allWords = data;
    console.log(`Загружено ${allWords.length} слов`);
    renderAll();
    handleHash();
  });

window.addEventListener("hashchange", handleHash);

// 🔗 Обработка перехода по хэшу
function handleHash() {
  const key = decodeURIComponent(location.hash.slice(1)).toLowerCase();
  if (!key) {
    renderAll();
    return;
  }

  const word = allWords.find(w => w.word.toLowerCase() === key);
  if (word) {
    displayWord(word);
  } else {
    showNotFound(key);
  }
}

// 🧾 Отображение одного слова
function displayWord(word) {
  const container = document.querySelector(".main");
  if (!container) {
    console.warn("Не найдены элементы для отображения слова");
    return;
  }

  const examplesHtml = word.definitions.map(def => `
    <div>
      <p><strong>${def.meaning}</strong></p>
      <ul>
        ${def.examples.map(ex => `<li>💬 ${ex}</li>`).join("")}
      </ul>
    </div>
  `).join("");

  container.innerHTML = `
    <div class="card large">
      <h2>${word.word}</h2>
      <p class="definition">${word.definition}</p>
      <h3>Примеры:</h3>
      ${examplesHtml}
      <a class="more-link" href="#">← Назад к списку</a>
    </div>
  `;
}

// ❌ Если слово не найдено
function showNotFound(term) {
  const container = document.querySelector(".main");
  if (!container) return;

  container.innerHTML = `
    <div class="error">
      <h2>Слово «${term}» не найдено</h2>
      <p>Проверьте написание или <a href="#">вернитесь на главную</a>.</p>
    </div>
  `;
}

// 📚 Показ всех слов или по категории
function renderAll(category = "all") {
  const container = document.querySelector(".main");
  if (!container) return;

  const filtered = category === "all"
    ? allWords
    : allWords.filter(w => w.category === category);

  container.innerHTML = filtered.map(word => `
    <div class="card small">
      <p class="card-label">${categoryLabel(word.category)}</p>
      <h2 class="word-title">${word.word}</h2>
      <p class="definition">${word.definition}</p>
      <a class="more-link" href="#${encodeURIComponent(word.word)}">Подробнее</a>
    </div>
  `).join("");
}

// 🗂 Выбор категории
document.querySelectorAll("#categoryOptions button").forEach(btn => {
  btn.addEventListener("click", () => {
    const value = btn.value;
    renderAll(value);
  });
});

// 🔍 Поиск
const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-button");

searchInput.addEventListener("input", () => {
  const term = searchInput.value.trim().toLowerCase();
  if (term.length < 2) return removeSuggestions();

  const suggestions = allWords
    .filter(w => w.word.toLowerCase().includes(term))
    .slice(0, 5);

  showSuggestions(suggestions);
});

searchButton.addEventListener("click", () => {
  const term = searchInput.value.trim().toLowerCase();
  const match = allWords.find(w => w.word.toLowerCase() === term);
  if (match) {
    location.hash = `#${encodeURIComponent(match.word)}`;
  } else {
    showNotFound(term);
  }
});

// 💬 Автоподсказки
function showSuggestions(words) {
  removeSuggestions();

  const list = document.createElement("div");
  list.className = "suggestions";
  Object.assign(list.style, {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    background: "white",
    border: "1px solid #ccc",
    borderRadius: "8px",
    zIndex: "10",
    maxHeight: "200px",
    overflowY: "auto",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
  });

  words.forEach(word => {
    const item = document.createElement("div");
    item.textContent = word.word;
    Object.assign(item.style, {
      padding: "10px 16px",
      cursor: "pointer",
      transition: "background 0.2s"
    });
    item.addEventListener("mouseover", () => item.style.background = "#f2f2f2");
    item.addEventListener("mouseout", () => item.style.background = "white");
    item.addEventListener("click", () => {
      searchInput.value = word.word;
      location.hash = `#${encodeURIComponent(word.word)}`;
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

// 🎭 Название категории с эмодзи
function categoryLabel(cat) {
  switch (cat) {
    case "emotion": return "😊 Эмоции";
    case "social": return "💬 Общение";
    case "character": return "👤 Отношения";
    case "status": return "⭐ Оценка";
    default: return cat;
  }
}

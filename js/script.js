let allWords = [];

// Загрузка данных
fetch("data/words.json")
  .then(res => res.json())
  .then(data => {
    allWords = data;
    console.log(`Загружено ${allWords.length} слов`);
    if (location.hash.length > 1) handleHash();
  })
  .catch(err => console.error("Ошибка загрузки слов:", err));

// Обработчики событий
window.addEventListener("hashchange", handleHash);
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  // Инициализация кнопки категорий
  const categoryButton = document.getElementById("categoryButton");
  const categoryOptions = document.getElementById("categoryOptions");
  
  if (categoryButton && categoryOptions) {
    categoryButton.addEventListener("click", (e) => {
      e.stopPropagation();
      categoryButton.classList.toggle("active");
      categoryOptions.classList.toggle("show");
    });

    // Закрытие при клике вне меню
    document.addEventListener("click", () => {
      categoryButton.classList.remove("active");
      categoryOptions.classList.remove("show");
    });

    // Обработка выбора категории
    document.querySelectorAll("#categoryOptions button").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const value = btn.value;
        renderCategory(value);
        
        // Обновление placeholder
        const searchInput = document.querySelector(".search-input");
        if (searchInput) {
          searchInput.placeholder = value === "all" 
            ? "Найти слово..." 
            : `🔍 Поиск в категории: ${categoryLabel(value)}`;
        }
        
        // Скрытие меню
        categoryButton.classList.remove("active");
        categoryOptions.classList.remove("show");
      });
    });
  }

  // Инициализация поиска
  const searchInput = document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-button");
  
  if (searchInput && searchButton) {
    searchInput.addEventListener("input", handleSearchInput);
    searchButton.addEventListener("click", handleSearchSubmit);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSearchSubmit();
    });
  }
}

// 🔗 Обработка хэша
function handleHash() {
  const key = decodeURIComponent(location.hash.slice(1)).toLowerCase();
  if (!key) return clearMain();

  const word = allWords.find(w => w.word.toLowerCase() === key);
  if (word) {
    displayWord(word);
  } else {
    showNotFound(key);
  }
}

// 🧹 Очистка основной зоны
function clearMain() {
  const container = document.querySelector(".main");
  if (container) container.innerHTML = "";
}

// 🧾 Показ одного слова
function displayWord(word) {
  const container = document.querySelector(".main");
  if (!container) return;

  const examplesHtml = word.definitions?.map(def => `
    <div>
      <p><strong>${def.meaning}</strong></p>
      <ul>
        ${def.examples?.map(ex => `<li>💬 ${ex}</li>`).join("") || ''}
      </ul>
    </div>
  `).join("") || '';

  container.innerHTML = `
    <div class="card large">
      <h2>${word.word}</h2>
      <p class="definition">${word.definition}</p>
      ${examplesHtml ? `<h3>Примеры:</h3>${examplesHtml}` : ''}
      <a class="more-link" href="#">← Назад к списку</a>
    </div>
  `;
}

// ❌ Слово не найдено
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

// 📂 Показ слов по категории
function renderCategory(category) {
  const container = document.querySelector(".main");
  if (!container) return;

  const filtered = category === "all" 
    ? allWords 
    : allWords.filter(w => w.category === category);

  if (!filtered.length) {
    container.innerHTML = `
      <div class="word-not-found">
        <h2>${category === "all" ? "Нет слов в базе" : "Нет слов в категории"}</h2>
        <p>Попробуйте выбрать другую категорию.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="cards">
      ${filtered.map(word => `
        <div class="card small">
          <p class="card-label">${categoryLabel(word.category)}</p>
          <h2 class="word-title">${word.word}</h2>
          <p class="definition">${word.definition}</p>
          <a class="more-link" href="#${encodeURIComponent(word.word)}">Подробнее</a>
        </div>
      `).join("")}
    </div>
  `;
}

// 🔍 Обработка поиска
function handleSearchInput() {
  const term = this.value.trim().toLowerCase();
  if (term.length < 2) return removeSuggestions();

  const suggestions = allWords
    .filter(w => w.word.toLowerCase().includes(term))
    .slice(0, 5);

  showSuggestions(suggestions);
}

function handleSearchSubmit() {
  const term = document.querySelector(".search-input")?.value.trim().toLowerCase();
  if (!term) return;

  const match = allWords.find(w => w.word.toLowerCase() === term);
  if (match) {
    location.hash = `#${encodeURIComponent(match.word)}`;
    removeSuggestions();
  } else {
    showNotFound(term);
  }
}

// 💬 Подсказки поиска
function showSuggestions(words) {
  removeSuggestions();
  if (!words.length) return;

  const list = document.createElement("div");
  list.className = "suggestions";
  
  words.forEach(word => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.innerHTML = `
      <span>${word.word}</span>
      <small>${categoryLabel(word.category)}</small>
    `;
    item.addEventListener("click", () => {
      document.querySelector(".search-input").value = word.word;
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

// 🎭 Метки категорий
function categoryLabel(cat) {
  const labels = {
    emotion: "😊 Эмоции",
    social: "💬 Общение",
    character: "👤 Отношения",
    status: "⭐ Оценка",
    all: "📚 Все слова"
  };
  return labels[cat] || cat;
}

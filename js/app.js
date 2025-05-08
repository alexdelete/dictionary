document.addEventListener("DOMContentLoaded", () => {
  const wordContainer = document.getElementById("word-content");
  const wordTitle = document.getElementById("word-title");
  const wordPage = document.getElementById("word-page");
  const searchInput = document.getElementById("search-input");
  const suggestionsContainer = document.getElementById("suggestions");
  const backLink = document.getElementById("back-link");
  const categorySelect = document.getElementById("category-select");

  let words = [];
  let filteredWords = [];

  // Функция загрузки слов из файла (или базы данных)
  async function loadWords() {
    try {
      const response = await fetch("data/words.json"); // Путь к файлу с данными
      const data = await response.json();
      words = data.words; // Массив слов
      filteredWords = words; // Изначально показываем все слова
      initWordOfTheDay();
    } catch (err) {
      console.error("Ошибка загрузки словаря:", err);
    }
  }

  // Функция для инициализации "Слова дня"
  function initWordOfTheDay() {
    const wordOfTheDay = words[Math.floor(Math.random() * words.length)];
    const wotdTitle = document.getElementById("wotd-title");
    const wotdDefinition = document.getElementById("wotd-definition");
    const wotdLink = document.getElementById("wotd-link");

    if (wotdTitle) wotdTitle.textContent = wordOfTheDay.word;
    if (wotdDefinition) wotdDefinition.textContent = wordOfTheDay.definition;
    if (wotdLink) wotdLink.href = `#${encodeURIComponent(wordOfTheDay.word)}`;
  }

  // Функция для отображения слова на странице
  function showWord(word) {
    const wordData = words.find(w => w.word.toLowerCase() === word.toLowerCase());

    if (!wordData) {
      wordTitle.textContent = word;
      wordContainer.innerHTML = "<p>Слово не найдено. Попробуйте другое слово.</p>";
      wordPage.classList.remove("hidden");
      document.body.classList.add("hidden");
      return;
    }

    wordTitle.textContent = wordData.word;
    wordContainer.innerHTML = `
      <p><em>${wordData.transcription || ''}</em></p>
      ${wordData.definitions.map(def => `
        <div class="definition-block">
          <p><strong>${def.meaning}</strong></p>
          <ul>${def.examples.map(ex => `<li>${ex}</li>`).join("")}</ul>
        </div>
      `).join("")}
      ${wordData.tags ? `<p class="tags"><strong>Теги:</strong> ${wordData.tags.join(", ")}</p>` : ""}
      <p class="rating">❤️ ${wordData.rating || 0} | Добавлено: ${wordData.date_added}</p>
    `;

    wordPage.classList.remove("hidden");
    document.body.classList.add("hidden");
  }

  // Обработчик для перехода по хешу
  window.addEventListener("hashchange", () => {
    const word = decodeURIComponent(location.hash.slice(1));
    if (word) {
      showWord(word);
    } else {
      wordPage.classList.add("hidden");
      document.body.classList.remove("hidden");
    }
  });

  // Обработчик ввода в поле поиска
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    // Фильтруем слова по категории и поисковому запросу
    filteredWords = words.filter(word => {
      const matchesCategory = categorySelect.value === "all" || word.category === categorySelect.value;
      const matchesQuery = word.word.toLowerCase().includes(query) || word.definition.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    // Обновляем подсказки
    updateSuggestions();
  });

  // Обновление подсказок в поиске
  function updateSuggestions() {
    suggestionsContainer.innerHTML = "";
    filteredWords.slice(0, 5).forEach(word => {
      const suggestion = document.createElement("div");
      suggestion.classList.add("suggestion");
      suggestion.textContent = word.word;
      suggestion.addEventListener("click", () => {
        searchInput.value = word.word;
        showWord(word.word);
        location.hash = word.word; // Обновляем хеш в URL
      });
      suggestionsContainer.appendChild(suggestion);
    });
  }

  // Обработчик для категории выбора
  categorySelect.addEventListener("change", () => {
    const category = categorySelect.value;
    filteredWords = category === "all" ? words : words.filter(word => word.category === category);
    updateSuggestions(); // Обновить подсказки с новым фильтром
  });

  // Кнопка "Назад" для возвращения на главную страницу
  backLink.addEventListener("click", (e) => {
    e.preventDefault();
    wordPage.classList.add("hidden");
    document.body.classList.remove("hidden");
  });

  // Загрузка слов при старте
  loadWords();
});

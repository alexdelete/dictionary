document.addEventListener("DOMContentLoaded", async () => {
  // Элементы интерфейса
  const wordContainer = document.getElementById("word-content");
  const wordTitle = document.getElementById("word-title");
  const wordPage = document.getElementById("word-page");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.querySelector(".search-button");
  const backLink = document.getElementById("back-link");
  const suggestions = document.getElementById("suggestions");
  const app = document.getElementById("app");
  
  // Элементы для выбора категории
  const categoryToggle = document.getElementById("category-toggle");
  const categoryDropdown = document.getElementById("category-dropdown");
  const categoryCurrent = document.querySelector(".category-current");
  const categoryOptions = document.querySelectorAll(".category-option");
  
  let words = []; // Здесь будут храниться все слова
  let currentCategory = 'all'; // Текущая выбранная категория

  // Загрузка данных
  async function loadWords() {
    try {
      const response = await fetch("data/words.json");
      const data = await response.json();
      words = data.words;
      initWordOfTheDay();
      updateSuggestions();
    } catch (err) {
      console.error("Ошибка загрузки словаря:", err);
      wordContainer.innerHTML = "Ошибка загрузки словаря. Пожалуйста, попробуйте позже.";
    }
  }

  // Инициализация "Слова дня"
  function initWordOfTheDay() {
    if (!words.length) return;
    
    const today = new Date().toISOString().split("T")[0];
    const storedWord = JSON.parse(localStorage.getItem("wordOfTheDay") || "{}");
    
    let wordOfTheDay;
    if (storedWord.date === today) {
      wordOfTheDay = storedWord.word;
    } else {
      // Выбираем случайное слово
      wordOfTheDay = words[Math.floor(Math.random() * words.length)];
      localStorage.setItem("wordOfTheDay", JSON.stringify({
        date: today,
        word: wordOfTheDay
      }));
    }
    
    const title = document.getElementById("wotd-title");
    const definition = document.getElementById("wotd-definition");
    const link = document.getElementById("wotd-link");
    
    if (title) title.textContent = wordOfTheDay.word;
    if (definition) definition.textContent = wordOfTheDay.definition;
    if (link) link.setAttribute("href", "#" + encodeURIComponent(wordOfTheDay.word));
  }

  // Обновление подсказок
  function updateSuggestions() {
    const query = searchInput.value.toLowerCase();
    
    const filtered = words.filter(word => {
      const matchesQuery = word.word.toLowerCase().includes(query) || 
                         word.definition.toLowerCase().includes(query);
      const matchesCategory = currentCategory === 'all' || word.category === currentCategory;
      return matchesQuery && matchesCategory;
    }).slice(0, 5);
    
    renderSuggestions(filtered);
  }

  // Отображение подсказок
  function renderSuggestions(words) {
    suggestions.innerHTML = words.map(word => `
      <div class="suggestion" data-word="${word.word}">
        <strong>${highlight(word.word, searchInput.value)}</strong>
        <span>${word.definition}</span>
      </div>
    `).join('');
    
    suggestions.classList.toggle("show", words.length > 0);
    
    // Изменяем скругление углов у поисковой строки
    const searchWrapper = document.querySelector('.search-input-wrapper');
    searchWrapper.style.borderRadius = words.length > 0 
      ? '40px 40px 0 0' 
      : '40px';
  }

  // Подсветка совпадений
  function highlight(text, query) {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index >= 0) {
      return text.substring(0, index) + 
        '<mark>' + text.substring(index, index + query.length) + '</mark>' + 
        text.substring(index + query.length);
    }
    return text;
  }

  // Показать страницу слова
  function showWord(word) {
    const wordData = words.find(w => w.word.toLowerCase() === word.toLowerCase());
    
    if (!wordData) {
      wordTitle.textContent = word;
      wordContainer.innerHTML = "<p>Слово не найдено. Попробуйте другое слово.</p>";
      wordPage.classList.remove("hidden");
      app.classList.add("hidden");
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
    app.classList.add("hidden");
    searchInput.value = wordData.word;
  }

  // Обработчики событий
  function handleHashChange() {
    const word = decodeURIComponent(location.hash.slice(1));
    if (word) {
      showWord(word);
    } else {
      wordPage.classList.add("hidden");
      app.classList.remove("hidden");
    }
  }

  function searchHandler() {
    const query = searchInput.value.trim();
    if (query) {
      location.hash = encodeURIComponent(query);
    }
  }

  // Инициализация выбора категории
  categoryToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    categoryDropdown.classList.toggle('show');
    categoryToggle.classList.toggle('active');
  });

  categoryOptions.forEach(option => {
    option.addEventListener('click', () => {
      currentCategory = option.dataset.value;
      categoryCurrent.textContent = option.textContent;
      categoryDropdown.classList.remove('show');
      categoryToggle.classList.remove('active');
      updateSuggestions();
    });
  });

  // Закрытие выпадающего меню при клике вне его
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.category-toggle') && !e.target.closest('.category-dropdown')) {
      categoryDropdown.classList.remove('show');
      categoryToggle.classList.remove('active');
    }
    
    // Закрытие подсказок при клике вне поисковой строки
    if (!e.target.closest('.search-input-wrapper')) {
      suggestions.classList.remove('show');
      document.querySelector('.search-input-wrapper').style.borderRadius = '40px';
    }
  });

  // Инициализация поиска
  searchInput.addEventListener("input", updateSuggestions);
  searchButton.addEventListener("click", searchHandler);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchHandler();
  });
  
  suggestions.addEventListener("click", (e) => {
    const suggestion = e.target.closest(".suggestion");
    if (suggestion) {
      const word = suggestion.dataset.word;
      location.hash = encodeURIComponent(word);
    }
  });
  
  backLink.addEventListener("click", (e) => {
    e.preventDefault();
    history.replaceState(null, "", " ");
    wordPage.classList.add("hidden");
    app.classList.remove("hidden");
    searchInput.value = "";
    searchInput.focus();
  });
  
  window.addEventListener("hashchange", handleHashChange);
  
  // Загрузка данных
  loadWords();
});

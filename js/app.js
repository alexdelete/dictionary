document.addEventListener("DOMContentLoaded", async () => {
  // Основные элементы
  const wordContainer = document.getElementById("word-content");
  const wordTitle = document.getElementById("word-title");
  const wordPage = document.getElementById("word-page");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.querySelector(".search-button");
  const backLink = document.getElementById("back-link");
  const suggestions = document.getElementById("suggestions");
  const app = document.getElementById("app");
  
  // Элементы категорий
  const categoryToggle = document.getElementById("category-toggle");
  const categoryDropdown = document.getElementById("category-dropdown");
  const categoryCurrent = document.querySelector(".category-current");
  const categoryOptions = document.querySelectorAll(".category-option");
  
  let words = [];
  let currentCategory = 'all';

  // Загрузка слов
  async function loadWords() {
    try {
      const response = await fetch("data/words.json");
      const data = await response.json();
      words = data.words;
      initWordOfTheDay();
    } catch (err) {
      console.error("Ошибка загрузки словаря:", err);
      wordContainer.innerHTML = "Ошибка загрузки словаря. Пожалуйста, попробуйте позже.";
    }
  }

  // Слово дня
  function initWordOfTheDay() {
    if (!words.length) return;
    
    const today = new Date().toISOString().split("T")[0];
    const storedWord = JSON.parse(localStorage.getItem("wordOfTheDay") || "{}");
    
    let wordOfTheDay = storedWord.date === today ? storedWord.word : 
      words[Math.floor(Math.random() * words.length)];
    
    if (!storedWord.date === today) {
      localStorage.setItem("wordOfTheDay", JSON.stringify({
        date: today,
        word: wordOfTheDay
      }));
    }
    
    document.getElementById("wotd-title").textContent = wordOfTheDay.word;
    document.getElementById("wotd-definition").textContent = 
      wordOfTheDay.definitions[0].meaning;
    document.getElementById("wotd-link").setAttribute("href", 
      "#" + encodeURIComponent(wordOfTheDay.word));
  }

  // Поиск и подсказки
  function updateSuggestions() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query.length === 0) {
      suggestions.classList.remove("show");
      return;
    }
    
    const filtered = words.filter(word => {
      const wordMatch = word.word.toLowerCase().includes(query);
      const definitionMatch = word.definition.toLowerCase().includes(query);
      const categoryMatch = currentCategory === 'all' || word.category === currentCategory;
      return (wordMatch || definitionMatch) && categoryMatch;
    }).slice(0, 5);
    
    renderSuggestions(filtered);
  }

  function renderSuggestions(results) {
    suggestions.innerHTML = results.map(word => `
      <div class="suggestion" data-word="${word.word}">
        <strong>${highlight(word.word, searchInput.value)}</strong>
        <span>${word.definition}</span>
      </div>
    `).join('');
    
    suggestions.classList.toggle("show", results.length > 0);
    document.querySelector('.search-input-wrapper').style.borderRadius = 
      results.length > 0 ? '40px 40px 0 0' : '40px';
  }

  function highlight(text, query) {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    return index >= 0 
      ? `${text.substring(0, index)}<mark>${text.substring(index, index + query.length)}</mark>${text.substring(index + query.length)}`
      : text;
  }

  // Виртуальные страницы
  function showWord(word) {
    const wordData = words.find(w => 
      w.word.toLowerCase() === word.toLowerCase());
    
    if (!wordData) {
      wordTitle.textContent = word;
      wordContainer.innerHTML = "<p>Слово не найдено. Попробуйте другое слово.</p>";
    } else {
      wordTitle.textContent = wordData.word;
      wordContainer.innerHTML = `
        <p><em>${wordData.transcription || ''}</em></p>
        ${wordData.definitions.map(def => `
          <div class="definition-block">
            <p><strong>${def.meaning}</strong></p>
            <ul>${def.examples.map(ex => `<li>${ex}</li>`).join('')}</ul>
          </div>
        `).join('')}
        ${wordData.tags ? `<p class="tags"><strong>Теги:</strong> ${wordData.tags.join(", ")}</p>` : ''}
        <p class="rating">❤️ ${wordData.rating || 0} | Добавлено: ${wordData.date_added}</p>
      `;
      searchInput.value = wordData.word;
    }
    
    wordPage.classList.remove("hidden");
    app.classList.add("hidden");
  }

  function handleHashChange() {
    const word = decodeURIComponent(location.hash.slice(1));
    word ? showWord(word) : (wordPage.classList.add("hidden"), app.classList.remove("hidden"));
  }

  // Обработчики событий
  function setupEventListeners() {
    // Категории
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

    // Поиск
    searchInput.addEventListener('input', updateSuggestions);
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) location.hash = encodeURIComponent(query);
    });
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        location.hash = encodeURIComponent(searchInput.value.trim());
      }
    });

    // Подсказки
    suggestions.addEventListener('click', (e) => {
      const suggestion = e.target.closest('.suggestion');
      if (suggestion) {
        location.hash = encodeURIComponent(suggestion.dataset.word);
      }
    });

    // Навигация
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      history.replaceState(null, "", " ");
      wordPage.classList.add("hidden");
      app.classList.remove("hidden");
      searchInput.value = "";
      searchInput.focus();
    });

    // Глобальные обработчики
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-input-wrapper')) {
        suggestions.classList.remove('show');
        document.querySelector('.search-input-wrapper').style.borderRadius = '40px';
      }
      if (!e.target.closest('.category-toggle') && !e.target.closest('.category-dropdown')) {
        categoryDropdown.classList.remove('show');
        categoryToggle.classList.remove('active');
      }
    });

    window.addEventListener('hashchange', handleHashChange);
  }

  // Инициализация
  await loadWords();
  setupEventListeners();
  handleHashChange(); // Проверяем хеш при загрузке
});

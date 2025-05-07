document.addEventListener("DOMContentLoaded", async () => {
  // Элементы интерфейса
  const wordContainer = document.getElementById("word-content");
  const wordTitle = document.getElementById("word-title");
  const wordPage = document.getElementById("word-page");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.querySelector(".search-button");
  const backLink = document.getElementById("back-link");
  const suggestions = document.getElementById("suggestions");
  const categorySelect = document.getElementById("category-select");
  const app = document.getElementById("app");
  categorySelect.addEventListener('focus');

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
    const selectedCategory = categorySelect.value;
    
    const filtered = words.filter(word => {
      const matchesQuery = word.word.toLowerCase().includes(query) || 
                         word.definition.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
      return matchesQuery && matchesCategory;
    }).slice(0, 5);
    
    renderSuggestions(filtered);
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

  // Инициализация
  searchInput.addEventListener("input", updateSuggestions);
  categorySelect.addEventListener("change", updateSuggestions);
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
// Анимация при фокусе/ховере на селекторе
categorySelect.addEventListener('focus', () => {
  categorySelect.parentElement.style.transform = 'translateY(-2px)';
  categorySelect.parentElement.style.boxShadow = '0 8px 40px rgba(0, 0, 0, 0.2)';
});

categorySelect.addEventListener('blur', () => {
  categorySelect.parentElement.style.transform = '';
  categorySelect.parentElement.style.boxShadow = '';
});

categorySelect.addEventListener('mouseenter', () => {
  categorySelect.parentElement.style.transform = 'translateY(-2px)';
});

categorySelect.addEventListener('mouseleave', () => {
  if (document.activeElement !== categorySelect) {
    categorySelect.parentElement.style.transform = '';
  }
});
// В функции renderSuggestions обновите стиль подсказок
function renderSuggestions(words) {
  const suggestionsContainer = document.getElementById('suggestions');
  suggestionsContainer.innerHTML = words.map(word => `
    <div class="suggestion" data-word="${word.word}">
      <strong>${highlight(word.word, searchInput.value)}</strong>
      <span>${word.definition}</span>
    </div>
  `).join('');
  
  suggestionsContainer.classList.toggle('show', words.length > 0);

  if (words.length > 0) {
    document.querySelector('.search-input-wrapper').style.borderRadius = '20px 20px 0 0';
  } else {
    document.querySelector('.search-input-wrapper').style.borderRadius = '40px';
  }
}

  
  // Плавное появление
  suggestions.classList.toggle('show', words.length > 0);
  
  // Расширяем поисковую строку
  if (words.length > 0) {
    document.querySelector('.search-input-wrapper').style.borderRadius = '20px 20px 0 0';
  } else {
    document.querySelector('.search-input-wrapper').style.borderRadius = '40px';
  }
}

// Добавьте обработчик закрытия подсказок
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-input-wrapper')) {
    suggestions.classList.remove('show');
    document.querySelector('.search-input-wrapper').style.borderRadius = '40px';
  }
});

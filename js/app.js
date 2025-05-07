document.addEventListener("DOMContentLoaded", () => {
  const wordContainer = document.getElementById("word-content");
  const wordTitle = document.getElementById("word-title");
  const wordPage = document.getElementById("word-page");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.querySelector(".search-button");
  const backLink = document.getElementById("back-link");
  const titleEl = document.getElementById("word-title");
const defEl = document.getElementById("word-definition");
const linkEl = document.getElementById("word-link");
 


  // Загрузка данных из локального файла
  fetch("data/words.json")
    .then(res => res.json())
    .then(data => {
      words = data.words;
      window.addEventListener("hashchange", handleHashChange);
      handleHashChange(); // Обработка при первой загрузке
    })
    .catch(err => {
      console.error("Ошибка загрузки словаря:", err);
      wordContainer.innerHTML = "Ошибка загрузки словаря. Пожалуйста, попробуйте позже.";
    });

  function handleHashChange() {
    const slug = decodeURIComponent(location.hash.slice(1)).toLowerCase().trim();

    if (!slug) {
      wordPage.classList.add("hidden");
      return;
    }

    // Поиск слова без учета регистра
    const wordData = words.find(w => 
      w.word.toLowerCase() === slug || 
      w.word.toLowerCase().replace(/ё/g, "е") === slug.replace(/ё/g, "е")
    );

    if (!wordData) {
      wordTitle.textContent = slug; // Показываем искомое слово
      wordContainer.innerHTML = "<p>Слово не найдено. Попробуйте другое слово.</p>";
      wordPage.classList.remove("hidden");
      return;
    }

    // Отображение найденного слова
    wordTitle.textContent = wordData.word;
    wordContainer.innerHTML = `
      <p><em>${wordData.transcription}</em></p>
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
    searchInput.value = wordData.word; // Заполняем поисковую строку
  }

  // Обработчики событий
  backLink.addEventListener("click", (e) => {
    e.preventDefault();
    history.replaceState(null, "", " "); // Очищаем хеш без добавления в историю
    wordPage.classList.add("hidden");
    searchInput.value = "";
    searchInput.focus();
  });

  searchButton.addEventListener("click", searchHandler);
  
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchHandler();
  });

  function searchHandler() {
    const query = searchInput.value.trim();
    if (query) {
      location.hash = encodeURIComponent(query);
    }
  }
});
const input = document.getElementById('search-input');
const select = document.getElementById('category-select');
const suggestions = document.getElementById('suggestions');
const wordTitle = document.getElementById('word-title');
const wordContent = document.getElementById('word-content');
const wordPage = document.getElementById('word-page');
const app = document.getElementById('app');
const backLink = document.getElementById('back-link');

// Фильтрация
function updateSuggestions() {
  const query = input.value.toLowerCase();
  const selectedCategory = select.value;

  const filtered = words.filter(({ word, category }) => {
    const matchesQuery = word.includes(query);
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  suggestions.innerHTML = filtered.map(({ word, definition }) =>
    `<div class="suggestion-item" data-word="${word}"><strong>${word}</strong>: ${definition}</div>`
  ).join('');
}

// Обработка клика на слово
suggestions.addEventListener('click', (e) => {
  const item = e.target.closest('.suggestion-item');
  if (item) {
    const selectedWord = item.dataset.word;
    window.location.hash = selectedWord;
  }
});

// Отображение слова по хешу
function showWordFromHash() {
  const hash = decodeURIComponent(location.hash.slice(1));
  const entry = words.find(w => w.word === hash);
  if (entry) {
    wordTitle.textContent = entry.word;
    wordContent.textContent = entry.definition;
    wordPage.classList.remove('hidden');
    app.classList.add('hidden');
  } else {
    wordPage.classList.add('hidden');
    app.classList.remove('hidden');
  }
}

// Назад
backLink.addEventListener('click', (e) => {
  e.preventDefault();
  history.pushState(null, '', '#');
  showWordFromHash();
});

window.addEventListener('hashchange', showWordFromHash);
window.addEventListener('DOMContentLoaded', () => {
  updateSuggestions();
  showWordFromHash();
});

input.addEventListener('input', updateSuggestions);
select.addEventListener('change', updateSuggestions);
async function loadWords() {
  const response = await fetch("data/words.json");
  const data = await response.json();
  return data.words;
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function getStoredWord() {
  return JSON.parse(localStorage.getItem("wordOfTheDay") || "{}");
}

function storeWordOfTheDay(wordObj) {
  localStorage.setItem("wordOfTheDay", JSON.stringify({
    date: getTodayDate(),
    word: wordObj
  }));
}

function showWordOfTheDay(selector, word) {
  const el = document.querySelector(selector);
  if (el) {
    el.textContent = `${word.word} — ${word.definition}`;
  }
}

async function initWordOfTheDay(selector) {
  const today = getTodayDate();
  const stored = getStoredWord();

  if (stored.date === today) {
    showWordOfTheDay(selector, stored.word);
    return;
  }

  const words = await loadWords();
  const randomWord = words[Math.floor(Math.random() * words.length)];
  storeWordOfTheDay(randomWord);
  showWordOfTheDay(selector, randomWord);
}
 // Показываем слово дня
  initWordOfTheDay("#word-of-the-day");
});

  let words = [];
function showWordOfTheDay(selector, word) {
  const el = document.querySelector(selector);
  const link = document.querySelector("#word-link");

  if (el) {
    el.innerHTML = `<h2 class="word-title">${word.word}</h2>
                    <p class="definition">${word.definition}</p>`;
  }

  if (link) {
    link.setAttribute("href", "#" + encodeURIComponent(word.word));
  }
}

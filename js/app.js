// Загрузка слов из файла JSON
let words = [];
fetch('data/words.json')
  .then(response => response.json())
  .then(data => { 
    words = data;
    initWordOfTheDay();
  });

// 1. Слово дня (рандомное слово, меняющееся каждые 24 часа)
function initWordOfTheDay() {
  const wotdTitle = document.getElementById('wotd-title');
  const wotdDefinition = document.getElementById('wotd-definition');
  const wotdLink = document.getElementById('wotd-link');

  // Храним дату последнего обновления и индекс слова в localStorage
  const now = new Date();
  const lastUpdate = localStorage.getItem('wotd-date');
  const randomIndex = localStorage.getItem('wotd-index');

  if (!lastUpdate || !randomIndex || new Date(lastUpdate).getDate() !== now.getDate()) {
    const newIndex = Math.floor(Math.random() * words.length);
    localStorage.setItem('wotd-date', now.toISOString());
    localStorage.setItem('wotd-index', newIndex);
  }

  const word = words[localStorage.getItem('wotd-index')];
  wotdTitle.textContent = word.word;
  wotdDefinition.textContent = word.definition;
  wotdLink.href = `#${word.word}`;
}

// 2. Поиск с подсказками и категориями
const searchInput = document.getElementById('search-input');
const suggestions = document.getElementById('suggestions');
const categorySelect = document.getElementById('category-select');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const category = categorySelect.value;

  if (query.length === 0) {
    suggestions.innerHTML = '';
    return;
  }

  const filteredWords = words.filter(word => {
    const matchesQuery = word.word.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || word.category === category;
    return matchesQuery && matchesCategory;
  });

  suggestions.innerHTML = filteredWords
    .map(word => `<div class="suggestion-item" data-word="${word.word}">${word.word}</div>`)
    .join('');

  document.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      const selectedWord = words.find(w => w.word === item.dataset.word);
      showWordPage(selectedWord);
    });
  });
});

// 3. Хэши и виртуальные страницы
window.addEventListener('hashchange', () => {
  const hash = decodeURIComponent(window.location.hash.substring(1));
  const word = words.find(w => w.word.toLowerCase() === hash.toLowerCase());
  if (word) {
    showWordPage(word);
  } else {
    hideWordPage();
  }
});

function showWordPage(word) {
  const wordPage = document.getElementById('word-page');
  const wordTitle = document.getElementById('word-title');
  const wordContent = document.getElementById('word-content');

  wordTitle.textContent = word.word;
  wordContent.innerHTML = `<p>${word.definition}</p>`;
  wordPage.classList.remove('hidden');
}

function hideWordPage() {
  const wordPage = document.getElementById('word-page');
  wordPage.classList.add('hidden');
}

document.getElementById('back-link').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.hash = '';
  hideWordPage();
});

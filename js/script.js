// Путь к JSON-файлу со словами
const WORDS_JSON_PATH = 'data/words.json';

// Глобальные переменные
let words = [];

// DOM-элементы
const elements = {
  wordContainer: document.querySelector('.word-container'),
  wordTitle: document.querySelector('.word-title'),
  wordDefinition: document.querySelector('.word-definition'),
  backLink: document.querySelector('.back-link'),
  categoryButton: document.querySelector('.category-button'),
  categoryOptions: document.querySelector('.category-options'),
  searchInput: document.querySelector('.search-input'),
  searchButton: document.querySelector('.search-button'),
  mainContent: document.querySelector('.main'),
  cards: document.querySelector('.cards')
};

// ======== Проверка элементов ========
const checkElements = () => {
  for (const [key, element] of Object.entries(elements)) {
    if (!element) console.warn(`Элемент ${key} не найден в DOM`);
  }
};

// ======== Темный режим ========
const toggleDarkMode = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('dark-mode', isDark);
};

const initDarkMode = () => {
  if (localStorage.getItem('dark-mode') === 'true' || 
      (!localStorage.getItem('dark-mode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }

  const darkModeToggle = document.querySelector('.dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }
};

// ======== Меню категорий ========
const initCategoryMenu = () => {
  if (!elements.categoryButton || !elements.categoryOptions) return;

  const toggleCategoryMenu = (event) => {
    event.stopPropagation();
    elements.categoryOptions.classList.toggle('show');
    elements.categoryButton.classList.toggle('active');
  };

  const closeCategoryMenu = (event) => {
    if (!elements.categoryOptions.contains(event.target) && !elements.categoryButton.contains(event.target)) {
      elements.categoryOptions.classList.remove('show');
      elements.categoryButton.classList.remove('active');
    }
  };

  const selectCategory = (event) => {
    const selectedCategory = event.target.value;
    if (selectedCategory) {
      console.log(`Выбрана категория: ${selectedCategory}`);
      elements.categoryOptions.classList.remove('show');
      elements.categoryButton.classList.remove('active');
    }
  };

  elements.categoryButton.addEventListener('click', toggleCategoryMenu);
  document.addEventListener('click', closeCategoryMenu);
  elements.categoryOptions.addEventListener('click', selectCategory);
};

// ======== Загрузка слов из JSON ========
const loadWords = async () => {
  try {
    const response = await fetch(WORDS_JSON_PATH);
    words = await response.json();
    console.log(`Загружено ${words.length} слов`);
  } catch (error) {
    console.error('Ошибка загрузки words.json:', error);
    showError('Не удалось загрузить словарь. Пожалуйста, попробуйте позже.');
  }
};

// ======== Поиск и навигация ========
const performSearch = (term) => {
  term = term.trim();
  if (!term) {
    window.location.hash = '';
    return;
  }

  const foundWord = words.find(word => 
    word.word.toLowerCase() === term.toLowerCase()
  ) || words.find(word => 
    word.word.toLowerCase().includes(term.toLowerCase()) ||
    (word.definition && word.definition.toLowerCase().includes(term.toLowerCase()))
  );

  if (foundWord) {
    window.location.hash = encodeURIComponent(foundWord.word.toLowerCase());
  } else {
    showNotFound(term);
  }
};

// ======== Управление страницами ========
const showMainPage = () => {
  if (elements.wordContainer) elements.wordContainer.classList.add('hidden');
  if (elements.mainContent) elements.mainContent.classList.remove('hidden');
  if (elements.searchInput) elements.searchInput.value = '';
};

const showWordPage = (word) => {
  if (!elements.wordTitle || !elements.wordDefinition) {
    console.error('Не найдены элементы для отображения слова');
    return;
  }

  elements.wordTitle.textContent = word.word;
  elements.wordDefinition.textContent = word.definition;
  
  if (elements.searchInput) elements.searchInput.value = word.word;
  if (elements.wordContainer) elements.wordContainer.classList.remove('hidden');
  if (elements.mainContent) elements.mainContent.classList.add('hidden');
};

const showNotFound = (term) => {
  if (!elements.wordContainer) return;

  elements.wordContainer.innerHTML = `
    <div class="word-not-found">
      <h2>Слово "${term}" не найдено</h2>
      <p>Попробуйте другое слово или вернитесь на <a href="#" class="back-link">главную страницу</a></p>
    </div>
  `;
  elements.wordContainer.classList.remove('hidden');
  if (elements.mainContent) elements.mainContent.classList.add('hidden');

  document.querySelector('.back-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '';
  });
};

const showError = (message) => {
  if (!elements.wordContainer) return;

  elements.wordContainer.innerHTML = `<p class="error">${message}</p>`;
  elements.wordContainer.classList.remove('hidden');
  if (elements.mainContent) elements.mainContent.classList.add('hidden');
};

const findWordByHash = (hash) => {
  return words.find(word => 
    word.word.toLowerCase() === hash ||
    word.word.toLowerCase().replace(/\s+/g, '-') === hash
  );
};

const updatePage = () => {
  const hash = decodeURIComponent(window.location.hash.substring(1)).toLowerCase();

  if (!hash) {
    showMainPage();
    return;
  }

  const word = findWordByHash(hash);
  if (word) {
    showWordPage(word);
  } else {
    showNotFound(hash);
  }
};

// ======== Инициализация ========
const initSearch = () => {
  if (elements.searchButton && elements.searchInput) {
    elements.searchButton.addEventListener('click', () => {
      performSearch(elements.searchInput.value);
    });

    elements.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch(elements.searchInput.value);
      }
    });
  }
};

const initBackLink = () => {
  if (elements.backLink) {
    elements.backLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '';
    });
  }
};

const init = async () => {
  checkElements();
  initDarkMode();
  initCategoryMenu();
  initSearch();
  initBackLink();
  
  await loadWords();
  updatePage();

  window.addEventListener('hashchange', updatePage);
};

document.addEventListener('DOMContentLoaded', init);

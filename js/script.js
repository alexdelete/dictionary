// Путь к JSON-файлу со словами
const WORDS_JSON_PATH = 'data/words.json';

// Глобальные переменные
let words = [];
let currentSearchTerm = '';

// DOM-элементы
const wordContainer = document.getElementById('word-container');
const wordTitle = document.getElementById('word-title');
const wordDefinition = document.getElementById('word-definition');
const backLink = document.getElementById('back-link');
const categoryButton = document.getElementById('categoryButton');
const categoryOptions = document.getElementById('categoryOptions');
const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');
const mainContent = document.querySelector('.main');

// ======== Темный режим ========
const toggleDarkMode = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('dark-mode', isDark);
};

if (localStorage.getItem('dark-mode') === 'true' || 
    (!localStorage.getItem('dark-mode') && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}

document.querySelector('.dark-mode-toggle').addEventListener('click', toggleDarkMode);

// ======== Меню категорий ========
if (categoryButton && categoryOptions) {
  const toggleCategoryMenu = (event) => {
    event.stopPropagation();
    categoryOptions.classList.toggle('show');
    categoryButton.classList.toggle('active');
  };

  const closeCategoryMenu = (event) => {
    if (!categoryOptions.contains(event.target) && !categoryButton.contains(event.target)) {
      categoryOptions.classList.remove('show');
      categoryButton.classList.remove('active');
    }
  };

  const selectCategory = (event) => {
    const selectedCategory = event.target.value;
    if (selectedCategory) {
      console.log(`Выбрана категория: ${selectedCategory}`);
      categoryOptions.classList.remove('show');
      categoryButton.classList.remove('active');
      // Здесь можно добавить фильтрацию по категориям
    }
  };

  categoryButton.addEventListener('click', toggleCategoryMenu);
  document.addEventListener('click', closeCategoryMenu);
  categoryOptions.addEventListener('click', selectCategory);
}

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

  // Ищем точное совпадение сначала
  let foundWord = words.find(word => 
    word.word.toLowerCase() === term.toLowerCase()
  );

  // Если нет точного совпадения, ищем частичное
  if (!foundWord) {
    foundWord = words.find(word => 
      word.word.toLowerCase().includes(term.toLowerCase()) ||
      (word.definition && word.definition.toLowerCase().includes(term.toLowerCase()))
    );
  }

  if (foundWord) {
    window.location.hash = encodeURIComponent(foundWord.word.toLowerCase());
  } else {
    showNotFound(term);
  }
};

// ======== Управление хэш-навигацией ========
const updatePage = () => {
  const hash = decodeURIComponent(window.location.hash.substring(1)).toLowerCase();
  currentSearchTerm = hash;

  if (!hash) {
    showMainPage();
    return;
  }

  showWordPage(hash);
};

const showMainPage = () => {
  wordContainer.classList.add('hidden');
  mainContent.classList.remove('hidden');
  if (searchInput) searchInput.value = '';
};

const showWordPage = (wordHash) => {
  const word = findWordByHash(wordHash);
  
  if (!word) {
    showNotFound(wordHash);
    return;
  }

  displayWord(word);
};

const findWordByHash = (hash) => {
  return words.find(word => 
    word.word.toLowerCase() === hash ||
    word.word.toLowerCase().replace(/\s+/g, '-') === hash
  );
};

const displayWord = (word) => {
  wordTitle.textContent = word.word;
  wordDefinition.textContent = word.definition;
  
  if (searchInput) searchInput.value = word.word;
  
  wordContainer.classList.remove('hidden');
  mainContent.classList.add('hidden');
};

const showNotFound = (term) => {
  wordContainer.innerHTML = `
    <div class="word-not-found">
      <h2>Слово "${term}" не найдено</h2>
      <p>Попробуйте другое слово или вернитесь на <a href="#" id="back-link">главную страницу</a></p>
    </div>
  `;
  wordContainer.classList.remove('hidden');
  mainContent.classList.add('hidden');
  
  // Добавляем обработчик для новой кнопки "Назад"
  document.getElementById('back-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '';
  });
};

const showError = (message) => {
  wordContainer.innerHTML = `<p class="error">${message}</p>`;
  wordContainer.classList.remove('hidden');
  mainContent.classList.add('hidden');
};

// ======== Инициализация ========
const init = async () => {
  await loadWords();
  
  // Инициализация поиска
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
      performSearch(searchInput.value);
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch(searchInput.value);
      }
    });
  }

  // Обработка кнопки "Назад"
  if (backLink) {
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '';
    });
  }

  // Первоначальное обновление страницы
  updatePage();

  // Следим за изменениями хэша
  window.addEventListener('hashchange', updatePage);
};

init();

// Путь к JSON-файлу со словами
const WORDS_JSON_PATH = 'data/words.json';

// Глобальные переменные
let words = []; // Для хранения слов из JSON
let currentSearchTerm = ''; // Для хранения текущего поискового запроса

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

// Инициализация темного режима
if (localStorage.getItem('dark-mode') === 'true' || (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('dark-mode'))) {
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
    console.log('Слова успешно загружены:', words.length);
  } catch (error) {
    console.error('Ошибка загрузки файла words.json:', error);
    // Можно показать пользователю сообщение об ошибке
    wordContainer.innerHTML = '<p class="error">Не удалось загрузить словарь. Пожалуйста, попробуйте позже.</p>';
  }
};

// ======== Поиск и навигация ========
const performSearch = (term) => {
  if (!term.trim()) {
    window.location.hash = '';
    return;
  }

  const foundWord = words.find(word => 
    word.word.toLowerCase().includes(term.toLowerCase()) ||
    (word.definition && word.definition.toLowerCase().includes(term.toLowerCase()))
  );

  if (foundWord) {
    window.location.hash = encodeURIComponent(foundWord.word.toLowerCase());
  } else {
    // Если слово не найдено, можно показать сообщение
    alert('Слово не найдено в словаре');
    // Или создать элемент для отображения сообщения в интерфейсе
    // wordContainer.innerHTML = `<p class="not-found">Слово "${term}" не найдено</p>`;
  }
};

// ======== Управление хэш-навигацией ========
const updatePage = () => {
  const hash = decodeURIComponent(window.location.hash.substring(1));
  currentSearchTerm = hash;

  if (!hash) {
    // Главная страница
    wordContainer.classList.add('hidden');
    mainContent.classList.remove('hidden');
    if (searchInput) searchInput.value = '';
    return;
  }

  // Ищем слово по хэшу
  const word = words.find(item => 
    item.word.toLowerCase() === hash.toLowerCase() ||
    item.word.toLowerCase().replace(/\s+/g, '-') === hash.toLowerCase()
  );

  if (!word) {
    wordContainer.innerHTML = `
      <div class="word-not-found">
        <h2>Слово "${hash}" не найдено</h2>
        <p>Попробуйте поискать другое слово или вернитесь на <a href="#" id="back-link">главную страницу</a></p>
      </div>
    `;
    wordContainer.classList.remove('hidden');
    mainContent.classList.add('hidden');
    return;
  }

  // Обновляем содержимое страницы слова
  wordTitle.textContent = word.word;
  wordDefinition.textContent = word.definition;
  if (searchInput) searchInput.value = word.word;
  
  wordContainer.classList.remove('hidden');
  mainContent.classList.add('hidden');
};

// ======== Инициализация ========
const init = async () => {
  await loadWords();
  
  // Инициализация поиска
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
      performSearch(searchInput.value.trim());
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch(searchInput.value.trim());
      }
    });
  }

  // Обработка кнопки "Назад"
  backLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '';
  });

  // Первоначальное обновление страницы
  updatePage();

  // Следим за изменениями хэша
  window.addEventListener('hashchange', updatePage);
};

init();

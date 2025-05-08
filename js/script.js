// Путь к JSON-файлу со словами
const WORDS_JSON_PATH = 'data/words.json';

// Глобальные переменные
let words = []; // Для хранения слов из JSON

// DOM-элементы
const wordContainer = document.getElementById('word-container');
const wordTitle = document.getElementById('word-title');
const wordDefinition = document.getElementById('word-definition');
const backLink = document.getElementById('back-link');
const categoryButton = document.getElementById('categoryButton');
const categoryOptions = document.getElementById('categoryOptions');

// ======== Темный режим ========
const toggleDarkMode = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('dark-mode', isDark);
};

// Инициализация темного режима
if (localStorage.getItem('dark-mode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}

document.querySelector('.dark-mode-toggle').addEventListener('click', toggleDarkMode);

// ======== Меню категорий ========
if (categoryButton && categoryOptions) {
  // Открытие/закрытие меню категорий
  const toggleCategoryMenu = (event) => {
    event.stopPropagation();
    categoryOptions.classList.toggle('show');
  };

  // Закрытие меню при клике вне его
  const closeCategoryMenu = (event) => {
    if (!categoryOptions.contains(event.target) && !categoryButton.contains(event.target)) {
      categoryOptions.classList.remove('show');
    }
  };

  // Выбор категории
  const selectCategory = (event) => {
    const selectedCategory = event.target.value;
    if (selectedCategory) {
      console.log(`Выбрана категория: ${selectedCategory}`);
      categoryOptions.classList.remove('show');
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
  } catch (error) {
    console.error('Ошибка загрузки файла words.json:', error);
  }
};

// ======== Управление хэш-навигацией ========
const updatePage = () => {
  const hash = decodeURIComponent(window.location.hash.substring(1)); // Получаем хэш без #
  
  if (!hash) {
    // Если хэш пустой — возвращаемся на главную страницу
    wordContainer.classList.add('hidden');
    document.querySelector('.main').classList.remove('hidden');
    return;
  }

  // Ищем слово по хэшу
  const word = words.find((item) => item.word.toLowerCase() === hash.toLowerCase());
  if (!word) {
    alert('Слово не найдено!');
    return;
  }

  // Обновляем содержимое страницы
  wordTitle.textContent = word.word;
  wordDefinition.textContent = word.definition;
  wordContainer.classList.remove('hidden');
  document.querySelector('.main').classList.add('hidden');
};

// ======== Инициализация ========
const init = async () => {
  await loadWords(); // Загрузка слов из JSON
  updatePage(); // Обновление страницы на основе хэша

  window.addEventListener('hashchange', updatePage); // Обновление при изменении хэша

  // Кнопка "Назад" для возврата на главную страницу
  backLink.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.hash = ''; // Удаляем хэш
  });
};

init();

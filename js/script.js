// Темный режим
const toggleDarkMode = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('dark-mode', isDark);
};

if (localStorage.getItem('dark-mode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}

document.querySelector('.dark-mode-toggle').addEventListener('click', toggleDarkMode);

// Открытие/закрытие окна категорий
const categoryButton = document.getElementById('categoryButton');
const categoryOptions = document.getElementById('categoryOptions');

// Проверка на существование элементов
if (categoryButton && categoryOptions) {
  const toggleCategoryMenu = (event) => {
    event.stopPropagation();
    categoryOptions.classList.toggle('show');
  };

  // Закрытие меню при клике вне окна
  const closeCategoryMenu = (event) => {
    if (!categoryOptions.contains(event.target) && !categoryButton.contains(event.target)) {
      categoryOptions.classList.remove('show');
    }
  };

  // Выбор категории
  const selectCategory = (event) => {
    const selectedCategory = event.target.value;
    if (selectedCategory) {
      console.log(`Выбрана категория: ${selectedCategory}`); // Здесь вы можете добавить логику для обработки выбранной категории
      categoryOptions.classList.remove('show');
    }
  };

  // Привязка событий
  categoryButton.addEventListener('click', toggleCategoryMenu);
  document.addEventListener('click', closeCategoryMenu);
  categoryOptions.addEventListener('click', selectCategory);
}

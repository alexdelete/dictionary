document.addEventListener('DOMContentLoaded', function () {
  // Загрузка данных из words.json
  fetch('./data/words.json')
    .then(response => response.json())
    .then(data => {
      // Сохраняем слова в переменную
      const words = data.words;
      console.log(words); // Можешь удалить это в продакшн

      // Элементы на странице
      const searchInput = document.getElementById('search-input');
      const suggestionsContainer = document.getElementById('suggestions');
      const wordPage = document.getElementById('word-page');
      const wordTitle = document.getElementById('word-title');
      const wordContent = document.getElementById('word-content');
      const backLink = document.getElementById('back-link');

      // Функция отображения подсказок
      function displaySuggestions(query) {
        suggestionsContainer.innerHTML = ''; // Очистить текущие подсказки
        if (query.length < 2) return; // Показывать подсказки, если введено хотя бы 2 символа

        // Фильтруем слова по запросу
        const filteredWords = words.filter(word => 
          word.word.toLowerCase().includes(query.toLowerCase())
        );

        // Отображаем подсказки
        filteredWords.forEach(word => {
          const suggestionItem = document.createElement('div');
          suggestionItem.classList.add('autocomplete-suggestion');
          suggestionItem.textContent = word.word;
          suggestionItem.addEventListener('click', () => showWordPage(word));
          suggestionsContainer.appendChild(suggestionItem);
        });
      }

      // Функция для отображения страницы слова
      function showWordPage(word) {
        wordPage.classList.remove('hidden'); // Показываем страницу слова
        searchInput.value = ''; // Очищаем поле поиска
        suggestionsContainer.innerHTML = ''; // Очищаем подсказки

        // Отображаем информацию о слове
        wordTitle.textContent = word.word;
        wordContent.innerHTML = `
          <p><strong>Определение:</strong> ${word.definition}</p>
          <p><strong>Транскрипция:</strong> ${word.transcription}</p>
          <p><strong>Категория:</strong> ${word.category}</p>
          <p><strong>Дата добавления:</strong> ${word.date_added}</p>
          <p><strong>Теги:</strong> ${word.tags.join(', ')}</p>
          <h3>Дополнительные значения:</h3>
          <ul>
            ${word.definitions.map(def => `
              <li>
                <strong>${def.meaning}</strong><br>
                Примеры: ${def.examples.join(', ')}
              </li>
            `).join('')}
          </ul>
        `;
      }

      // Возвращаемся к поиску
      backLink.addEventListener('click', (e) => {
        e.preventDefault(); // Предотвращаем переход по ссылке
        wordPage.classList.add('hidden'); // Скрываем страницу слова
      });

      // Обработчик ввода в поле поиска
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        displaySuggestions(query);
      });

    })
    .catch(error => {
      console.error('Ошибка при загрузке данных:', error);
    });
});

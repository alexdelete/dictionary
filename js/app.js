document.addEventListener('DOMContentLoaded', function() {
  // Элементы
  const searchInput = document.getElementById('search-input');
  const suggestions = document.getElementById('suggestions');
  const wordPage = document.getElementById('word-page');
  const wordTitle = document.getElementById('word-title');
  const wordContent = document.getElementById('word-content');
  const backLink = document.getElementById('back-link');
  
  let wordsData = [];
  
  // Загрузка данных
  fetch('data/words.json')
    .then(response => response.json())
    .then(data => {
      wordsData = data.words;
      initSearch();
    });
  
  // Инициализация поиска
  function initSearch() {
    // Обработчик ввода
    searchInput.addEventListener('input', function() {
      const query = this.value.trim();
      if (query.length > 1) {
        showSuggestions(query);
      } else {
        hideSuggestions();
      }
    });
    
    // Обработчик клика по подсказке
    suggestions.addEventListener('click', function(e) {
      if (e.target.classList.contains('suggestion')) {
        const word = e.target.dataset.word;
        searchInput.value = word;
        showWordPage(word);
      }
    });
    
    // Кнопка "Назад"
    backLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.hash = '';
      showSearchPage();
    });
    
    // Обработчик хэша
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
  }
  
  // Показать подсказки
  function showSuggestions(query) {
    const results = wordsData.filter(word => 
      word.word.toLowerCase().includes(query.toLowerCase()) || 
      (word.transcription && word.transcription.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 5);
    
    if (results.length > 0) {
      suggestions.innerHTML = results.map(word => `
        <div class="suggestion" data-word="${word.word}">
          <strong>${highlight(word.word, query)}</strong>
          ${word.transcription ? `<span>${word.transcription}</span>` : ''}
        </div>
      `).join('');
      suggestions.classList.add('show');
    } else {
      hideSuggestions();
    }
  }
  
  // Подсветка текста
  function highlight(text, query) {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index >= 0) {
      return text.substring(0, index) + 
        '<mark>' + text.substring(index, index + query.length) + '</mark>' + 
        text.substring(index + query.length);
    }
    return text;
  }
  
  // Скрыть подсказки
  function hideSuggestions() {
    suggestions.classList.remove('show');
  }
  
  // Обработчик хэша
  function handleHashChange() {
    const word = decodeURIComponent(window.location.hash.substring(1));
    if (word) {
      showWordPage(word);
    } else {
      showSearchPage();
    }
  }
  
  // Показать страницу слова
  function showWordPage(word) {
    const wordData = wordsData.find(w => w.word.toLowerCase() === word.toLowerCase());
    if (wordData) {
      document.querySelector('.search-section').classList.remove('show');
      wordPage.classList.add('show');
      renderWord(wordData);
    } else {
      wordContent.innerHTML = '<p>Слово не найдено. Попробуйте другой запрос.</p>';
    }
  }
  
  // Рендер слова
  function renderWord(word) {
    wordTitle.textContent = word.word;
    
    let html = '';
    if (word.transcription) {
      html += `<p class="transcription">${word.transcription}</p>`;
    }
    
    word.definitions.forEach((def, i) => {
      html += `
        <div class="definition">
          <h3>Значение ${i+1}:</h3>
          <p>${def.meaning}</p>
          ${def.examples.map(ex => `<div class="example">${ex}</div>`).join('')}
        </div>
      `;
    });
    
    wordContent.innerHTML = html;
  }
  
  // Показать поиск
  function showSearchPage() {
    document.querySelector('.search-section').classList.add('show');
    wordPage.classList.remove('show');
    searchInput.focus();
  }
});

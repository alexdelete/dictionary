document.addEventListener('DOMContentLoaded', function() {
  // Элементы
  const searchInput = document.getElementById('search-input');
  const suggestions = document.getElementById('suggestions');
  const wordPage = document.getElementById('word-page');
  const wordTitle = document.getElementById('word-title');
  const wordContent = document.getElementById('word-content');
  const backLink = document.getElementById('back-link');
  const searchSection = document.querySelector('.search-section');
  
  let wordsData = [];

  // Загрузка данных
  fetch('data/words.json')
    .then(response => response.json())
    .then(data => {
      wordsData = data.words;
      initSearch();
    })
    .catch(error => console.error('Ошибка загрузки слов:', error));

  function initSearch() {
    // Поиск при вводе
    searchInput.addEventListener('input', function() {
      const query = this.value.trim();
      if (query.length > 1) {
        showSuggestions(query);
      } else {
        hideSuggestions();
      }
    });

    // Клик по подсказке
    suggestions.addEventListener('click', function(e) {
      const suggestion = e.target.closest('.suggestion');
      if (suggestion) {
        const word = suggestion.dataset.word;
        window.location.hash = encodeURIComponent(word);
      }
    });

    // Кнопка "Назад"
    backLink.addEventListener('click', function(e) {
      e.preventDefault();
      history.back();
    });

    // Обработка URL
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
  }

  function handleHashChange() {
    const word = decodeURIComponent(window.location.hash.substring(1));
    if (word) {
      showWordPage(word);
    } else {
      showSearchPage();
    }
  }

  function showWordPage(word) {
    const wordData = wordsData.find(w => 
      w.word.toLowerCase() === word.toLowerCase()
    );
    
    if (wordData) {
      searchSection.classList.add('hidden');
      wordPage.classList.remove('hidden');
      renderWord(wordData);
    } else {
      wordContent.innerHTML = '<p>Слово не найдено</p>';
    }
  }

  function renderWord(word) {
    wordTitle.textContent = word.word;
    let html = '';
    
    if (word.transcription) {
      html += `<p class="transcription">${word.transcription}</p>`;
    }
    
    word.definitions.forEach((def, i) => {
      html += `
        <div class="definition">
          <h3>Значение ${i+1}</h3>
          <p>${def.meaning}</p>
          ${def.examples.map(ex => `<div class="example">${ex}</div>`).join('')}
        </div>
      `;
    });
    
    wordContent.innerHTML = html;
  }

  function showSearchPage() {
    searchSection.classList.remove('hidden');
    wordPage.classList.add('hidden');
    searchInput.value = '';
    hideSuggestions();
  }

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

  function highlight(text, query) {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index >= 0) {
      return `${text.substring(0, index)}<mark>${text.substring(index, index + query.length)}</mark>${text.substring(index + query.length)}`;
    }
    return text;
  }

  function hideSuggestions() {
    suggestions.classList.remove('show');
  }
});

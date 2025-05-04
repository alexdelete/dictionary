// Обработчик выбора подсказки
function setupSuggestions() {
  document.querySelectorAll('.suggestion').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const word = item.dataset.word;
      window.location.hash = encodeURIComponent(word);
      document.getElementById('search-input').value = word;
    });
  });
}

// В функции showSuggestions:
function showSuggestions(results) {
  const container = document.getElementById('suggestions');
  container.innerHTML = results.map(word => `
    <div class="suggestion" data-word="${word.word}">
      <strong>${word.word}</strong>
      <span>${word.transcription}</span>
    </div>
  `).join('');
  
  setupSuggestions();
}
// Обработчик хеша
function handleHashChange() {
  const word = decodeURIComponent(window.location.hash.substring(1));
  
  if (word) {
    showWordPage(word);
  } else {
    showSearchPage();
  }
}

// Показ страницы слова
async function showWordPage(word) {
  const response = await fetch('data/words.json');
  const data = await response.json();
  const wordData = data.words.find(w => w.word.toLowerCase() === word.toLowerCase());
  
  if (wordData) {
    document.querySelector('.search-section').classList.add('hidden');
    document.getElementById('word-page').classList.remove('hidden');
    renderWord(wordData);
  }
}

// Инициализация
window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', handleHashChange);

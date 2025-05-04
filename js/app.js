// Получение случайного слова
function getRandomWord() {
  fetch('data/words.json')
    .then(response => response.json())
    .then(data => {
      const randomWord = data.words[Math.floor(Math.random() * data.words.length)];
      displayWord(randomWord);
    });
}

// Поиск по тегам
function searchByTag(tag) {
  fetch('data/words.json')
    .then(response => response.json())
    .then(data => {
      const filtered = data.words.filter(word => 
        word.tags.includes(tag)
      );
      console.log(`Слова с тегом "${tag}":`, filtered);
    });
}
// Роутер
function handleRoute() {
  const hash = window.location.hash.substring(1);
  
  if (hash) {
    showWordPage(hash);
  } else {
    showSearchPage();
  }
}

// Показать страницу слова
function showWordPage(word) {
document.querySelector('.search-section').classList.remove('hidden');
document.getElementById('word-page').classList.add('hidden');
  
  fetch('data/words.json')
    .then(response => response.json())
    .then(data => {
      const wordData = data.words.find(w => w.word.toLowerCase() === word.toLowerCase());
      if (wordData) {
        renderWord(wordData);
      } else {
        document.getElementById('word-content').innerHTML = `
          <p>Слово не найдено. Попробуйте <a href="#">другой запрос</a>.</p>
        `;
      }
    });
}

// Рендер слова
function renderWord(wordData) {
  document.getElementById('word-title').textContent = wordData.word;
  
  let html = `
    <div class="word-meta">
      <span class="transcription">${wordData.transcription}</span>
      <div class="tags">${wordData.tags.map(t => `<span>${t}</span>`).join('')}</div>
    </div>
  `;
  
  wordData.definitions.forEach((def, i) => {
    html += `
      <div class="definition">
        <h3>Значение ${i+1}:</h3>
        <p>${def.meaning}</p>
        ${def.examples.map(ex => `<blockquote>${ex}</blockquote>`).join('')}
      </div>
    `;
  });
  
  document.getElementById('word-content').innerHTML = html;
}

// Назад к поиску
document.getElementById('back-link').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.hash = '';
  showSearchPage();
});

// Инициализация
window.addEventListener('hashchange', handleRoute);
handleRoute();

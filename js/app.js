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

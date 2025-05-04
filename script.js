function showWord(word) {
    const data = wordsDatabase[word.toLowerCase()];
    if (data) {
      document.getElementById('word-title').textContent = word;
      document.getElementById('definition').textContent = data.definition;
      document.getElementById('examples').innerHTML = 
        data.examples.map(ex => `<li>${ex}</li>`).join('');
      document.getElementById('origin').textContent = data.origin;
    } else {
      document.getElementById('word-content').innerHTML = `
        <p>Слово не найдено. Попробуйте другое или <a href="#">предложите его</a>.</p>
      `;
    }
  }
  
  // Обработчик поиска
  document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const word = document.getElementById('search-input').value.trim();
    if (word) {
      window.location.hash = word;
      showWord(word);
    }
  });
  
  // Обработчик хеша в URL
  window.addEventListener('hashchange', function() {
    const word = window.location.hash.substring(1);
    if (word) showWord(word);
  });
  
  // Проверка при загрузке
  if (window.location.hash) {
    showWord(window.location.hash.substring(1));
  }
  const wordsDatabase = {
    "кринж": {
      definition: "Чувство неловкости или стыда за чужие действия",
      examples: [
        "Этот мем — полный кринж!",
        "Я кринжую с его поведения"
      ],
      origin: "От англ. cringe"
    },
    "флекс": {
      definition: "Показное хвастовство",
      examples: [
        "Хватит флексить своими покупками",
        "Он любит флексить в инстаграме"
      ],
      origin: "От англ. flex"
    },
    "рофл": {
      definition: "Сильный смех (букв. 'катаюсь по полу от смеха')",
      examples: [
        "Этот комментарий — просто рофл!",
        "Я рофлю с этой ситуации"
      ],
      origin: "От англ. ROFL"
    }
  };
  // База слов для подсказок (можно загружать отдельно)
const wordSuggestions = [
    "кринж", "флекс", "рофл", "хейтер", "краш", 
    "гамать", "агриться", "чилить", "вайб", "рил"
  ];
  
  const searchInput = document.getElementById('searchInput');
  const suggestionsContainer = document.getElementById('suggestions');
  
  // Функция показа подсказок
  function showSuggestions(input) {
    suggestionsContainer.innerHTML = '';
    
    if (input.length < 1) {
      suggestionsContainer.style.display = 'none';
      return;
    }
    
    const filtered = wordSuggestions.filter(word => 
      word.toLowerCase().includes(input.toLowerCase())
    );
    
    if (filtered.length > 0) {
      filtered.forEach(word => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = word;
        div.addEventListener('click', () => {
          searchInput.value = word;
          suggestionsContainer.style.display = 'none';
          // Здесь можно сразу выполнить поиск
          performSearch(word);
        });
        suggestionsContainer.appendChild(div);
      });
      suggestionsContainer.style.display = 'block';
    } else {
      suggestionsContainer.style.display = 'none';
    }
  }
  
  // Функция поиска (заглушка)
  function performSearch(word) {
    console.log('Ищем:', word);
    // Здесь будет ваш код для поиска и отображения слова
  }
  
  // Обработчики событий
  searchInput.addEventListener('input', (e) => {
    showSuggestions(e.target.value);
  });
  
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.length > 0) {
      showSuggestions(searchInput.value);
    }
  });
  
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.style.display = 'none';
    }
  });
  
  // Можно добавить поддержку клавиатуры
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
      const items = suggestionsContainer.querySelectorAll('.suggestion-item');
      if (items.length === 0) return;
      
      let current = -1;
      items.forEach((item, index) => {
        if (item.classList.contains('highlighted')) {
          item.classList.remove('highlighted');
          current = index;
        }
      });
      
      if (e.key === 'ArrowDown') {
        current = (current + 1) % items.length;
      } else if (e.key === 'ArrowUp') {
        current = (current - 1 + items.length) % items.length;
      } else if (e.key === 'Enter' && current >= 0) {
        searchInput.value = items[current].textContent;
        suggestionsContainer.style.display = 'none';
        performSearch(items[current].textContent);
        return;
      }
      
      items[current].classList.add('highlighted');
      items[current].scrollIntoView({ block: 'nearest' });
    }
  });
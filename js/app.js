// Глобальные переменные
let wordsData = {};
let currentWordOfTheDay = null;

// Загрузка данных
async function loadWordsData() {
    try {
        const response = await fetch('data/words.json');
        wordsData = await response.json();
        console.log('Данные загружены, слов:', Object.keys(wordsData).length);
    } catch (error) {
        console.error('Ошибка загрузки words.json:', error);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async function() {
    await loadWordsData();
    initWordOfTheDay();
    initSearch();
    initRouting();
    
    // Проверяем хэш при загрузке (на случай, если пользователь зашёл по прямой ссылке)
    setTimeout(checkHash, 100); // Небольшая задержка для надёжности
});

// Слово дня
function initWordOfTheDay() {
    if (!wordsData) return;

    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const words = Object.keys(wordsData);
    const index = Math.floor(seededRandom(seed) * words.length);
    currentWordOfTheDay = words[index];
    
    updateWordOfTheDayUI(currentWordOfTheDay);
}

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function updateWordOfTheDayUI(word) {
    if (!word || !wordsData[word]) return;
    
    const wordData = wordsData[word];
    document.getElementById('wotd-title').textContent = word;
    document.getElementById('wotd-definition').textContent = wordData.definition;
    
    const wotdLink = document.getElementById('wotd-link');
    wotdLink.href = `#word/${encodeURIComponent(word)}`;
    wotdLink.onclick = function(e) {
        e.preventDefault();
        window.location.hash = `word/${encodeURIComponent(word)}`;
    };
}

// Поиск и подсказки
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions');
    const searchButton = document.querySelector('.search-button');
    
    if (!searchInput) {
        console.error('Элемент search-input не найден!');
        return;
    }

    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        const category = document.getElementById('category-select').value;
        
        if (!query) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('visible');
            return;
        }
        
        const filteredWords = Object.keys(wordsData).filter(word => {
            const wordMatch = word.toLowerCase().includes(query);
            const definitionMatch = wordsData[word].definition.toLowerCase().includes(query);
            const categoryMatch = category === 'all' || wordsData[word].category === category;
            return (wordMatch || definitionMatch) && categoryMatch;
        }).slice(0, 5);
        
        showSuggestions(filteredWords);
    });

    // Обработка клика по подсказке
    suggestionsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('suggestion-item')) {
            const word = e.target.getAttribute('data-word');
            searchInput.value = word;
            suggestionsContainer.innerHTML = '';
            window.location.hash = `word/${encodeURIComponent(word)}`;
        }
    });

    // Поиск по Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch(this.value.trim());
        }
    });

    // Поиск по кнопке
    searchButton.addEventListener('click', function() {
        performSearch(searchInput.value.trim());
    });
}

function showSuggestions(words) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';
    
    if (words.length === 0) {
        suggestionsContainer.classList.remove('visible');
        return;
    }
    
    words.forEach(word => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion-item';
        suggestion.textContent = word;
        suggestion.setAttribute('data-word', word);
        suggestionsContainer.appendChild(suggestion);
    });
    
    suggestionsContainer.classList.add('visible');
}

function performSearch(query) {
    if (!query) return;
    
    // Закрываем подсказки
    document.getElementById('suggestions').classList.remove('visible');
    
    // Проверяем, есть ли точное совпадение со словом
    if (wordsData[query]) {
        window.location.hash = `word/${encodeURIComponent(query)}`;
        return;
    }
    
    // Ищем частичные совпадения
    const foundWord = Object.keys(wordsData).find(word => 
        word.toLowerCase() === query.toLowerCase()
    );
    
    if (foundWord) {
        window.location.hash = `word/${encodeURIComponent(foundWord)}`;
    } else {
        alert('Слово не найдено. Попробуйте другой запрос.');
    }
}

// Роутинг
function initRouting() {
    window.addEventListener('hashchange', checkHash);
    
    // Кнопка "Назад"
    const backLink = document.getElementById('back-link');
    if (backLink) {
        backLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = '';
        });
    }
}

function checkHash() {
    const hash = window.location.hash;
    
    if (hash.startsWith('#word/')) {
        const word = decodeURIComponent(hash.substring(6));
        showWordPage(word);
    } else {
        showMainPage();
    }
}

function showWordPage(word) {
    if (!wordsData[word]) {
        showMainPage();
        return;
    }
    
    document.querySelector('.main').classList.add('hidden');
    document.getElementById('word-page').classList.remove('hidden');
    
    const wordData = wordsData[word];
    document.getElementById('word-title').textContent = word;
    
    const wordContent = document.getElementById('word-content');
    wordContent.innerHTML = `
        <div class="word-definition">
            <p>${wordData.definition}</p>
        </div>
        ${wordData.examples ? `
        <div class="word-examples">
            <h3>Примеры:</h3>
            <ul>
                ${wordData.examples.map(ex => `<li>${ex}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        <div class="word-category">
            <span class="category-tag">${getCategoryEmoji(wordData.category)} ${getCategoryName(wordData.category)}</span>
        </div>
    `;
    
    // Прокрутка вверх и фокус на заголовок для accessibility
    window.scrollTo(0, 0);
    document.getElementById('word-title').focus();
}

function showMainPage() {
    document.querySelector('.main').classList.remove('hidden');
    document.getElementById('word-page').classList.add('hidden');
    window.scrollTo(0, 0);
}

// Вспомогательные функции
function getCategoryEmoji(category) {
    const emojis = {
        'emotion': '😊',
        'social': '💬',
        'character': '👤',
        'status': '⭐'
    };
    return emojis[category] || '🔹';
}

function getCategoryName(category) {
    const names = {
        'emotion': 'Эмоции',
        'social': 'Общение',
        'character': 'Отношения',
        'status': 'Оценка'
    };
    return names[category] || 'Другое';
}

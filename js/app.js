// Глобальные переменные
let wordsData = [];
let currentWordOfTheDay = null;

// Загрузка данных
async function loadWordsData() {
    try {
        const response = await fetch('data/words.json');
        const data = await response.json();
        wordsData = data.words; // Получаем массив слов из объекта
        console.log('Данные загружены, слов:', wordsData.length);
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
    
    // Проверяем хэш при загрузке
    setTimeout(checkHash, 100);
});

// Слово дня
function initWordOfTheDay() {
    if (!wordsData || wordsData.length === 0) return;

    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = Math.floor(seededRandom(seed) * wordsData.length % wordsData.length;
    currentWordOfTheDay = wordsData[index];
    
    updateWordOfTheDayUI(currentWordOfTheDay);
}

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function updateWordOfTheDayUI(wordObj) {
    if (!wordObj) return;
    
    document.getElementById('wotd-title').textContent = wordObj.word;
    document.getElementById('wotd-definition').textContent = wordObj.definition;
    
    const wotdLink = document.getElementById('wotd-link');
    wotdLink.href = `#word/${encodeURIComponent(wordObj.word)}`;
    wotdLink.onclick = function(e) {
        e.preventDefault();
        window.location.hash = `word/${encodeURIComponent(wordObj.word)}`;
    };
}

// Поиск и подсказки
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions');
    const searchButton = document.querySelector('.search-button');
    const categorySelect = document.getElementById('category-select');
    
    if (!searchInput) {
        console.error('Элемент search-input не найден!');
        return;
    }

    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        const category = categorySelect.value;
        
        if (!query) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('visible');
            return;
        }
        
        const filteredWords = wordsData.filter(item => {
            const wordMatch = item.word.toLowerCase().includes(query);
            const definitionMatch = item.definition.toLowerCase().includes(query);
            const categoryMatch = category === 'all' || item.category === category;
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

    // Фильтрация по категории
    categorySelect.addEventListener('change', function() {
        if (searchInput.value.trim().length > 0) {
            searchInput.dispatchEvent(new Event('input'));
        }
    });
}

function showSuggestions(words) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';
    
    if (words.length === 0) {
        suggestionsContainer.classList.remove('visible');
        return;
    }
    
    words.forEach(wordObj => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion-item';
        suggestion.textContent = wordObj.word;
        suggestion.setAttribute('data-word', wordObj.word);
        suggestionsContainer.appendChild(suggestion);
    });
    
    suggestionsContainer.classList.add('visible');
}

function performSearch(query) {
    if (!query) return;
    
    // Закрываем подсказки
    document.getElementById('suggestions').classList.remove('visible');
    
    // Ищем точное совпадение
    const foundWord = wordsData.find(item => 
        item.word.toLowerCase() === query.toLowerCase()
    );
    
    if (foundWord) {
        window.location.hash = `word/${encodeURIComponent(foundWord.word)}`;
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
    const wordObj = wordsData.find(item => item.word === word);
    if (!wordObj) {
        showMainPage();
        return;
    }
    
    document.querySelector('.main').classList.add('hidden');
    document.getElementById('word-page').classList.remove('hidden');
    
    document.getElementById('word-title').textContent = wordObj.word;
    
    const wordContent = document.getElementById('word-content');
    wordContent.innerHTML = `
        <div class="word-meta">
            <span class="transcription">${wordObj.transcription || ''}</span>
            <span class="category-tag">${getCategoryEmoji(wordObj.category)} ${getCategoryName(wordObj.category)}</span>
            ${wordObj.rating ? `<span class="rating">Рейтинг: ${'★'.repeat(wordObj.rating)}</span>` : ''}
        </div>
        
        <div class="word-definition">
            <h3>Основное значение:</h3>
            <p>${wordObj.definition}</p>
        </div>
        
        ${wordObj.definitions && wordObj.definitions.length > 0 ? `
        <div class="additional-definitions">
            <h3>Дополнительные значения:</h3>
            ${wordObj.definitions.map(def => `
                <div class="definition-item">
                    <p><strong>${def.meaning}</strong></p>
                    ${def.examples && def.examples.length > 0 ? `
                    <div class="examples">
                        <h4>Примеры:</h4>
                        <ul>
                            ${def.examples.map(ex => `<li>${ex}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${wordObj.tags && wordObj.tags.length > 0 ? `
        <div class="word-tags">
            <h3>Теги:</h3>
            <div class="tags-container">
                ${wordObj.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
        ` : ''}
        
        <div class="word-footer">
            <small>Добавлено: ${wordObj.date_added || 'неизвестно'}</small>
        </div>
    `;
    
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

// Глобальные переменные
let wordsData = {};
let currentWordOfTheDay = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async function() {
    // Загрузка данных слов
    await loadWordsData();
    
    // Инициализация функционала
    initWordOfTheDay();
    initSearch();
    initRouting();
    initDarkMode();
});

// Загрузка данных из words.json
async function loadWordsData() {
    try {
        const response = await fetch('data/words.json');
        wordsData = await response.json();
        console.log('Данные слов успешно загружены');
    } catch (error) {
        console.error('Ошибка загрузки данных слов:', error);
    }
}

// Слово дня (одинаковое для всех устройств)
function initWordOfTheDay() {
    if (!wordsData || Object.keys(wordsData).length === 0) return;

    // Получаем детерминированное слово дня на основе даты
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const words = Object.keys(wordsData);
    const index = seededRandom(seed) % words.length;
    currentWordOfTheDay = words[index];
    
    // Обновляем UI
    updateWordOfTheDayUI(currentWordOfTheDay);
}

// Генератор псевдослучайных чисел с seed
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Обновление UI слова дня
function updateWordOfTheDayUI(word) {
    if (!word || !wordsData[word]) return;
    
    const wordData = wordsData[word];
    document.getElementById('wotd-title').textContent = word;
    document.getElementById('wotd-definition').textContent = wordData.definition;
    
    const wotdLink = document.getElementById('wotd-link');
    wotdLink.href = `#word/${encodeURIComponent(word)}`;
    wotdLink.onclick = (e) => {
        e.preventDefault();
        showWordPage(word);
    };
}

// Инициализация поиска с подсказками
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions');
    const categorySelect = document.getElementById('category-select');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        const category = categorySelect.value;
        
        if (query.length === 0) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('visible');
            return;
        }
        
        // Фильтрация слов по запросу и категории
        const filteredWords = Object.keys(wordsData).filter(word => {
            const matchesQuery = word.toLowerCase().includes(query) || 
                               wordsData[word].definition.toLowerCase().includes(query);
            const matchesCategory = category === 'all' || wordsData[word].category === category;
            return matchesQuery && matchesCategory;
        }).slice(0, 5); // Ограничиваем 5 подсказками
        
        showSuggestions(filteredWords);
    });
    
    // Обработка выбора подсказки
    suggestionsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('suggestion-item')) {
            const word = e.target.textContent;
            searchInput.value = word;
            suggestionsContainer.innerHTML = '';
            showWordPage(word);
        }
    });
    
    // Обработка нажатия Enter в поиске
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query && wordsData[query]) {
                showWordPage(query);
            }
        }
    });
    
    // Кнопка поиска
    document.querySelector('.search-button').addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query && wordsData[query]) {
            showWordPage(query);
        }
    });
    
    // Фильтрация по категории
    categorySelect.addEventListener('change', function() {
        if (searchInput.value.trim().length > 0) {
            searchInput.dispatchEvent(new Event('input'));
        }
    });
}

// Показать подсказки
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
        suggestionsContainer.appendChild(suggestion);
    });
    
    suggestionsContainer.classList.add('visible');
}

// Инициализация роутинга с хешами
function initRouting() {
    // Обработка начального URL
    checkHash();
    
    // Обработка изменений hash
    window.addEventListener('hashchange', checkHash);
    
    // Кнопка "Назад"
    document.getElementById('back-link').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.hash = '';
    });
}

// Проверка hash в URL
function checkHash() {
    const hash = window.location.hash;
    
    if (hash.startsWith('#word/')) {
        const word = decodeURIComponent(hash.substring(6));
        showWordPage(word);
    } else {
        showMainPage();
    }
}

// Показать страницу слова
function showWordPage(word) {
    if (!wordsData[word]) {
        showMainPage();
        return;
    }
    
    // Скрыть главную страницу и показать страницу слова
    document.querySelector('.main').classList.add('hidden');
    document.getElementById('word-page').classList.remove('hidden');
    
    // Заполнить данные слова
    const wordData = wordsData[word];
    document.getElementById('word-title').textContent = word;
    
    const wordContent = document.getElementById('word-content');
    wordContent.innerHTML = `
        <div class="word-definition">
            <p>${wordData.definition}</p>
        </div>
        ${wordData.examples ? `
        <div class="word-examples">
            <h3>Примеры использования:</h3>
            <ul>
                ${wordData.examples.map(example => `<li>${example}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        <div class="word-category">
            <span class="category-tag">${getCategoryEmoji(wordData.category)} ${getCategoryName(wordData.category)}</span>
        </div>
    `;
    
    // Прокрутка вверх
    window.scrollTo(0, 0);
}

// Показать главную страницу
function showMainPage() {
    document.querySelector('.main').classList.remove('hidden');
    document.getElementById('word-page').classList.add('hidden');
    window.scrollTo(0, 0);
}

// Вспомогательные функции для категорий
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

// Инициализация темной темы (если не добавлено в HTML)
function initDarkMode() {
    const toggle = document.querySelector('.dark-mode-toggle');
    if (!toggle) return;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark' || (!currentTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });
}

function searchWords(query) {
  return fetch('data/words.json')
    .then(response => response.json())
    .then(data => {
      return data.words.filter(item => 
        item.word.toLowerCase().includes(query.toLowerCase()) || 
        item.transcription.toLowerCase().includes(query.toLowerCase())
      );
    });
}
class Autocomplete {
  constructor(inputId, suggestionsId) {
    this.input = document.getElementById(inputId);
    this.suggestions = document.getElementById(suggestionsId);
    this.words = [];
    
    this.init();
  }
  
  async init() {
    await this.loadWords();
    this.setupEvents();
  }
  
  async loadWords() {
    const response = await fetch('data/words.json');
    const data = await response.json();
    this.words = data.words;
  }
  
  setupEvents() {
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('focus', this.handleInput.bind(this));
  }
  
  handleInput(e) {
    const query = e.target.value.trim();
    if (query.length > 0) {
      this.showSuggestions(query);
    } else {
      this.hideSuggestions();
    }
  }
  
  showSuggestions(query) {
    const results = this.words.filter(word => 
      word.word.toLowerCase().includes(query.toLowerCase()) ||
      word.transcription.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    this.renderSuggestions(results);
  }
  
  renderSuggestions(words) {
    this.suggestions.innerHTML = words.map(word => `
      <div class="suggestion" data-word="${word.word}">
        <strong>${this.highlight(word.word)}</strong>
        <span>${word.transcription}</span>
      </div>
    `).join('');
    
    this.suggestions.querySelectorAll('.suggestion').forEach(item => {
      item.addEventListener('click', () => {
        this.input.value = item.dataset.word;
        window.location.hash = item.dataset.word;
        this.hideSuggestions();
      });
    });
    
    this.suggestions.style.display = 'block';
  }
  
  highlight(text) {
    const query = this.input.value.toLowerCase();
    const index = text.toLowerCase().indexOf(query);
    if (index >= 0) {
      return text.substring(0, index) + 
        '<mark>' + text.substring(index, index + query.length) + '</mark>' + 
        text.substring(index + query.length);
    }
    return text;
  }
  
  hideSuggestions() {
    this.suggestions.style.display = 'none';
  }
}

// Инициализация
new Autocomplete('search-input', 'suggestions');

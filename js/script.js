document.addEventListener("DOMContentLoaded", () => {
  let allWords = [];
  let currentCategory = "all"; // отслеживаем выбранную категорию

  const searchInput = document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-button");
  const categoryButton = document.getElementById("categoryButton");
  const categoryOptions = document.getElementById("categoryOptions");
  const mainContainer = document.querySelector(".main");

fetch("data/words.json")
  .then(res => {
    if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
    return res.json();
  })
  .then(data => {
    allWords = data;
    console.log(`Загружено ${allWords.length} слов`);
  })
  .catch(error => {
    console.error("Не удалось загрузить слова:", error);
  });


  window.addEventListener("hashchange", handleHash);

  function handleHash() {
    const key = decodeURIComponent(location.hash.slice(1)).toLowerCase();
    if (!key) return clearMain();

    const word = allWords.find(w => w.word.toLowerCase() === key);
    if (word) {
      displayWord(word);
    } else {
      showNotFound(key);
    }
  }

  function clearMain() {
    if (mainContainer) mainContainer.innerHTML = "";
  }

  function displayWord(word) {
    if (!mainContainer) return;

    const examplesHtml = word.definitions.map(def => 
      <div>
        <p><strong>${def.meaning}</strong></p>
        <ul>
          ${def.examples.map(ex => <li>💬 ${ex}</li>).join("")}
        </ul>
      </div>
    ).join("");

    mainContainer.innerHTML = 
      <div class="card large">
        <h2>${word.word}</h2>
        <p class="definition">${word.definition}</p>
        <h3>Примеры:</h3>
        ${examplesHtml}
        <a class="more-link back-to-list" href="#">Назад к списку</a>
      </div>
    ;

    document.querySelector(".back-to-list").addEventListener("click", (e) => {
      e.preventDefault();
      history.replaceState(null, "", " ");
      clearMain();
      renderCategory(currentCategory); // ← теперь возвращаемся в текущую категорию
    });
  }

  function showNotFound(term) {
    if (!mainContainer) return;
    mainContainer.innerHTML = 
      <div class="error">
        <h2>Слово «${term}» не найдено</h2>
        <p>Проверьте написание или <a href="#">вернитесь на главную</a>.</p>
      </div>
    ;
  }

  function renderCategory(category) {
    if (!mainContainer) return;

    const filtered = category === "all"
      ? allWords
      : allWords.filter(w => w.category === category);

    if (filtered.length === 0) {
      mainContainer.innerHTML = 
        <div class="word-not-found">
          <h2>Нет слов в категории</h2>
          <p>Попробуйте выбрать другую категорию.</p>
        </div>
      ;
      return;
    }

    mainContainer.innerHTML = filtered.map(word => 
      <div class="card small">
        <p class="card-label">${categoryLabel(word.category)}</p>
        <h2 class="word-title">${word.word}</h2>
        <p class="definition">${word.definition}</p>
        <a class="more-link" href="#${encodeURIComponent(word.word)}">Подробнее</a>
      </div>
    ).join("");
  }

  // Показать/скрыть список категорий
  categoryButton.addEventListener("click", () => {
    categoryOptions.classList.toggle("visible");
  });

  // Обработчики кнопок категорий
  document.querySelectorAll("#categoryOptions button").forEach(btn => {
    btn.addEventListener("click", () => {
      const value = btn.value;
      currentCategory = value;

      renderCategory(value);
      history.replaceState(null, "", " ");

      searchInput.placeholder = value === "all"
        ? "Найти слово..."
        : 🔍 Поиск в категории: ${categoryLabel(value)};

      categoryOptions.classList.remove("visible");
    });
  });

  // Поиск
  searchButton.addEventListener("click", () => {
    const term = searchInput.value.trim().toLowerCase();
    const match = allWords.find(w =>
      (currentCategory === "all" || w.category === currentCategory) &&
      w.word.toLowerCase() === term
    );

    if (match) {
      location.hash = #${encodeURIComponent(match.word)};
      removeSuggestions();
    } else {
      showNotFound(term);
    }
  });

  // Подсказки
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    if (term.length < 2) return removeSuggestions();

    const suggestions = allWords
      .filter(w =>
        (currentCategory === "all" || w.category === currentCategory) &&
        w.word.toLowerCase().includes(term)
      )
      .slice(0, 5);

    showSuggestions(suggestions);
  });

  function showSuggestions(words) {
    removeSuggestions();

    const list = document.createElement("div");
    list.className = "suggestions";
    Object.assign(list.style, {
      position: "absolute",
      top: "100%",
      left: "0",
      right: "0",
      background: "white",
      border: "1px solid #ccc",
      borderRadius: "8px",
      zIndex: "10",
      maxHeight: "200px",
      overflowY: "auto",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
    });

    words.forEach(word => {
      const item = document.createElement("div");
      item.textContent = word.word;
      Object.assign(item.style, {
        padding: "10px 16px",
        cursor: "pointer",
        transition: "background 0.2s"
      });
      item.addEventListener("mouseover", () => item.style.background = "#f2f2f2");
      item.addEventListener("mouseout", () => item.style.background = "white");
      item.addEventListener("click", () => {
        searchInput.value = word.word;
        location.hash = #${encodeURIComponent(word.word)};
        removeSuggestions();
      });
      list.appendChild(item);
    });

    document.querySelector(".search-input-wrapper").appendChild(list);
  }

  function removeSuggestions() {
    const existing = document.querySelector(".suggestions");
    if (existing) existing.remove();
  }

  function categoryLabel(cat) {
    switch (cat) {
      case "emotion": return "😊 Эмоции";
      case "social": return "💬 Общение";
      case "character": return "👤 Отношения";
      case "status": return "⭐ Оценка";
      default: return cat;
    }
  }
});

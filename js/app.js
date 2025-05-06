document.addEventListener("DOMContentLoaded", () => {
  const wordContainer = document.getElementById("word-content");
  const wordTitle = document.getElementById("word-title");
  const wordPage = document.getElementById("word-page");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.querySelector(".search-button");
  const backLink = document.getElementById("back-link");

  let words = [];

  // Загрузка данных из локального файла
  fetch("data/words.json")
    .then(res => res.json())
    .then(data => {
      words = data.words;
      window.addEventListener("hashchange", handleHashChange);
      handleHashChange(); // Обработка при первой загрузке
    })
    .catch(err => {
      console.error("Ошибка загрузки словаря:", err);
      wordContainer.innerHTML = "Ошибка загрузки словаря. Пожалуйста, попробуйте позже.";
    });

  function handleHashChange() {
    const slug = decodeURIComponent(location.hash.slice(1)).toLowerCase().trim();

    if (!slug) {
      wordPage.classList.add("hidden");
      return;
    }

    // Поиск слова без учета регистра
    const wordData = words.find(w => 
      w.word.toLowerCase() === slug || 
      w.word.toLowerCase().replace(/ё/g, "е") === slug.replace(/ё/g, "е")
    );

    if (!wordData) {
      wordTitle.textContent = slug; // Показываем искомое слово
      wordContainer.innerHTML = "<p>Слово не найдено. Попробуйте другое слово.</p>";
      wordPage.classList.remove("hidden");
      return;
    }

    // Отображение найденного слова
    wordTitle.textContent = wordData.word;
    wordContainer.innerHTML = `
      <p><em>${wordData.transcription}</em></p>
      ${wordData.definitions.map(def => `
        <div class="definition-block">
          <p><strong>${def.meaning}</strong></p>
          <ul>${def.examples.map(ex => `<li>${ex}</li>`).join("")}</ul>
        </div>
      `).join("")}
      ${wordData.tags ? `<p class="tags"><strong>Теги:</strong> ${wordData.tags.join(", ")}</p>` : ""}
      <p class="rating">❤️ ${wordData.rating || 0} | Добавлено: ${wordData.date_added}</p>
    `;
    wordPage.classList.remove("hidden");
    searchInput.value = wordData.word; // Заполняем поисковую строку
  }

  // Обработчики событий
  backLink.addEventListener("click", (e) => {
    e.preventDefault();
    history.replaceState(null, "", " "); // Очищаем хеш без добавления в историю
    wordPage.classList.add("hidden");
    searchInput.value = "";
    searchInput.focus();
  });

  searchButton.addEventListener("click", searchHandler);
  
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchHandler();
  });

  function searchHandler() {
    const query = searchInput.value.trim();
    if (query) {
      location.hash = encodeURIComponent(query);
    }
  }
});

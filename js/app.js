document.addEventListener("DOMContentLoaded", () => {
  const wordContainer = document.getElementById("word-content");
  const wordTitle = document.getElementById("word-title");
  const wordPage = document.getElementById("word-page");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.querySelector(".search-button");
  const backLink = document.getElementById("back-link");

  let words = [];

fetch("https://alexdelete.github.io/dictionary/data/words.json")
    .then(res => res.json())
    .then(data => {
      words = data.words;

      window.addEventListener("hashchange", handleHashChange);
      handleHashChange(); // запуск при первой загрузке
    })
    .catch(err => {
      wordContainer.innerHTML = "Ошибка загрузки словаря: " + err;
    });

  function handleHashChange() {
    const slug = decodeURIComponent(location.hash.slice(1)).toLowerCase();

    if (!slug) {
      wordPage.classList.add("hidden");
      return;
    }

    const wordData = words.find(w => w.word.toLowerCase() === slug);

    if (!wordData) {
      wordTitle.textContent = "Слово не найдено";
      wordContainer.innerHTML = "<p>Попробуйте другое слово.</p>";
      wordPage.classList.remove("hidden");
      return;
    }

    wordTitle.textContent = wordData.word;
    wordContainer.innerHTML = `
      <p><em>${wordData.transcription}</em></p>
      ${wordData.definitions.map(def => `
        <div class="definition-block">
          <p><strong>${def.meaning}</strong></p>
          <ul>${def.examples.map(ex => `<li>${ex}</li>`).join("")}</ul>
        </div>
      `).join("")}
      <p class="tags"><strong>Теги:</strong> ${wordData.tags.join(", ")}</p>
      <p class="rating">❤️ ${wordData.rating} | Добавлено: ${wordData.date_added}</p>
    `;
    wordPage.classList.remove("hidden");
  }

  backLink.addEventListener("click", (e) => {
    e.preventDefault();
    wordPage.classList.add("hidden");
    location.hash = "";
  });

  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      location.hash = encodeURIComponent(query);
    }
  });
});


let allWords = [];

fetch("data/words.json")
  .then(res => res.json())
  .then(data => {
    allWords = data;
    renderWordsByCategory();
  });

function renderWordsByCategory() {
  const container = document.getElementById("wordsByCategory");
  if (!container) return;

  const categories = ["emotion", "social", "character", "status"];
  const categoryNames = {
    emotion: "😊 Эмоции",
    social: "💬 Общение",
    character: "👤 Отношения",
    status: "⭐ Оценка"
  };

  categories.forEach(cat => {
    const words = allWords.filter(w => w.category === cat);
    if (words.length === 0) return;

    const section = document.createElement("section");
    section.className = "category-section";

    const title = document.createElement("h2");
    title.textContent = categoryNames[cat];
    section.appendChild(title);

    const list = document.createElement("div");
    list.className = "word-list";

    words.forEach(word => {
      const card = document.createElement("div");
      card.className = "card small";
      card.innerHTML = `
        <h3 class="word-title">${word.word}</h3>
        <p class="definition">${word.definition}</p>
        <a href="index.html#${encodeURIComponent(word.word)}" class="more-link">Подробнее →</a>
      `;
      list.appendChild(card);
    });

    section.appendChild(list);
    container.appendChild(section);
  });
}

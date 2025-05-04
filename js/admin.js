function addNewWord() {
  const newWord = {
    word: prompt("Введите слово:"),
    transcription: prompt("Транскрипция:"),
    definitions: [],
    tags: prompt("Теги (через запятую):").split(',').map(tag => tag.trim()),
    rating: 0,
    date_added: new Date().toISOString().split('T')[0]
  };

  let definition;
  do {
    definition = {
      meaning: prompt("Значение:"),
      examples: prompt("Примеры (через точку с запятой):").split(';').map(ex => ex.trim())
    };
    newWord.definitions.push(definition);
  } while (confirm("Добавить ещё одно значение?"));

  // Добавляем в базу
  fetch('data/words.json')
    .then(response => response.json())
    .then(data => {
      newWord.id = data.words.length + 1;
      data.words.push(newWord);
      return data;
    })
    .then(updatedData => {
      // Здесь должен быть код для сохранения на сервер
      console.log("Новое слово добавлено:", newWord);
      alert(`Слово "${newWord.word}" успешно добавлено!`);
    });
}

// Использование:
// addNewWord() в консоли браузера

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

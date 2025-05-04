// Проверяем обновления при загрузке
const LAST_UPDATE_KEY = 'last_update';

async function checkUpdates() {
  const response = await fetch('data/words.json?t=' + Date.now());
  const lastModified = new Date(response.headers.get('last-modified'));
  
  const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
  if (!lastUpdate || new Date(lastUpdate) < lastModified) {
    localStorage.setItem(LAST_UPDATE_KEY, lastModified);
    location.reload();
  }
}

// Вызываем при загрузке
checkUpdates();

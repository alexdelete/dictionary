const toggleDarkMode = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('dark-mode', isDark);
};

// Установка начального состояния темного режима
if (localStorage.getItem('dark-mode') === 'true' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}

document.querySelector('.dark-mode-toggle').addEventListener('click', toggleDarkMode);

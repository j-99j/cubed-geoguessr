document.addEventListener('DOMContentLoaded', () => {
  const menuIcon = document.getElementById('menu-icon');
  const menuOverlay = document.getElementById('menu-overlay');

  menuIcon.addEventListener('click', (event) => {
      menuOverlay.classList.toggle('active');
      event.stopPropagation();
  });

  document.addEventListener('click', (event) => {
      if (!menuOverlay.contains(event.target) && !menuIcon.contains(event.target)) {
          menuOverlay.classList.remove('active');
      }
  });
});
  
  function updateLeaderboard(scores) {
    const leaderboard = document.getElementById('leaderboard-dynamic');
    leaderboard.innerHTML = '';
  
    scores.forEach((score, index) => {
      const row = document.createElement('div');
      row.className = 'leaderboard-row';
      row.innerHTML = `<span>${index + 2}. ${score.username}</span><span>${score.score}</span>`;
      leaderboard.appendChild(row);
    });
  }
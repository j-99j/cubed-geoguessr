function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.style.left = sidebar.style.left === '0px' ? '-250px' : '0px';
  }
  
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
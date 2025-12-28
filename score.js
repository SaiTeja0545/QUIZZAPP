// Load and display top 10 scores
function loadLeaderboard() {
  const leaderboardBody = document.getElementById('leaderboardBody');
  
  try {
    // Get all attempts from localStorage
    const allAttempts = JSON.parse(localStorage.getItem('quiz_attempts') || '{}');
    
    // Create array to store best scores per user
    const userBestScores = {};
    
    // Iterate through all users and their attempts
    for (const username in allAttempts) {
      const attempts = allAttempts[username];
      
      if (Array.isArray(attempts) && attempts.length > 0) {
        // Find the highest score for this user
        const bestAttempt = attempts.reduce((best, current) => {
          return (current.score > best.score) ? current : best;
        });
        
        userBestScores[username] = {
          username: username,
          score: bestAttempt.score,
          total: bestAttempt.total
        };
      }
    }
    
    // Convert to array and sort by score (descending)
    const sortedScores = Object.values(userBestScores)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Take top 10
    
    // Display results
    if (sortedScores.length === 0) {
      leaderboardBody.innerHTML = `
        <tr>
          <td colspan="3" class="no-data">No scores available yet. Be the first to take the quiz!</td>
        </tr>
      `;
      return;
    }
    
    // Build table rows
    leaderboardBody.innerHTML = sortedScores.map((entry, index) => {
      const rank = index + 1;
      let rankClass = 'rank';
      
      if (rank <= 3) {
        rankClass += ' top3 rank-' + rank;
      }
      
      const rankDisplay = rank <= 3 ? 
        (rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉') : 
        rank;
      
      return `
        <tr>
          <td class="${rankClass}">${rankDisplay}</td>
          <td class="username">${entry.username}</td>
          <td class="score">${entry.score} / ${entry.total}</td>
        </tr>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="3" class="no-data">Error loading leaderboard data</td>
      </tr>
    `;
  }
}

// Load leaderboard when page loads
document.addEventListener('DOMContentLoaded', loadLeaderboard);
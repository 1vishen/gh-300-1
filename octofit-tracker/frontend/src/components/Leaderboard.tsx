import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard')
      .then((response) => { if (active) setEntries(response.leaderboard); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section aria-labelledby="leaderboard-heading">
      <h2 id="leaderboard-heading" className="h3">Leaderboard</h2>
      {loading && <p role="status">Loading leaderboard...</p>}
      {error && <p role="alert">Unable to load leaderboard. Please try again later.</p>}
      {!loading && !error && entries.length === 0 && <p>No leaderboard rankings yet.</p>}
      {!loading && !error && entries.length > 0 && (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead><tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col">Points</th></tr></thead>
            <tbody>{entries.map((entry) => (
              <tr key={entry.teamName}>
                <th scope="row">{entry.rank}</th>
                <td>{entry.teamName}</td>
                <td>{entry.totalPoints}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

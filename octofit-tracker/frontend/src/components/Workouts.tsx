<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type WorkoutSuggestion = {
  _id?: string;
  title: string;
  focus: string;
  minutes: number;
  difficulty: string;
  reason: string;
};

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getJson<{ suggestions: WorkoutSuggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`)
      .then((response) => { if (active) setSuggestions(response.suggestions); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section aria-labelledby="workouts-heading">
      <h2 id="workouts-heading" className="h3">Workout suggestions</h2>
      {loading && <p role="status">Loading workout suggestions...</p>}
      {error && <p role="alert">Unable to load workout suggestions. Please try again later.</p>}
      {!loading && !error && suggestions.length === 0 && <p>No workout suggestions available.</p>}
      {!loading && !error && suggestions.length > 0 && (
        <div className="row g-3">
          {suggestions.map((suggestion, index) => (
            <div className="col-12 col-md-6" key={suggestion._id ?? `${suggestion.title}-${index}`}>
              <article className="border rounded p-3 h-100">
                <h3 className="h5">{suggestion.title}</h3>
                <p className="mb-1">{suggestion.focus} · {suggestion.minutes} minutes · {suggestion.difficulty}</p>
                <p className="mb-0">{suggestion.reason}</p>
              </article>
            </div>
          ))}
        </div>
      )}
    </section>
  );
=======
import { CapabilityCard } from './CapabilityCard.js';
export default function Workouts() {
  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." />;
>>>>>>> origin/main
}

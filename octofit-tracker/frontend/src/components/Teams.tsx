import { useEffect, useState } from 'react';
import { getJson, postJson } from '../api/client.js';

type Team = {
  _id?: string;
  name: string;
  mascot: string;
  members: string[];
};

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [mascot, setMascot] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    getJson<{ teams: Team[] }>('/api/teams')
      .then((response) => { if (active) setTeams(response.teams); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const availableMembers = [...new Set(teams.flatMap((team) => team.members ?? []))];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const response = await postJson<{ team: Team }>('/api/teams', {
        name,
        mascot,
        members: selectedMembers,
      });
      setTeams((current) => [response.team, ...current]);
      setName('');
      setMascot('');
      setSelectedMembers([]);
      setMessage('Team created.');
    } catch {
      setMessage('Unable to create team. Check the team name, mascot, and selected members.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="teams-heading">
      <h2 id="teams-heading" className="h3">Teams</h2>
      {loading && <p role="status">Loading teams...</p>}
      {error && <p role="alert">Unable to load teams. Please try again later.</p>}
      {!loading && !error && (
        <form className="row g-3 mb-4" onSubmit={handleSubmit}>
          <div className="col-12"><h3 className="h5">Create team</h3></div>
          <div className="col-12 col-md-5">
            <label className="form-label" htmlFor="team-name">Team name</label>
            <input className="form-control" id="team-name" required value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="col-12 col-md-5">
            <label className="form-label" htmlFor="team-mascot">Mascot</label>
            <input className="form-control" id="team-mascot" required value={mascot} onChange={(event) => setMascot(event.target.value)} />
          </div>
          {availableMembers.length > 0 && (
            <fieldset className="col-12">
              <legend className="form-label">Members (optional)</legend>
              <div className="d-flex flex-wrap gap-3">
                {availableMembers.map((member) => (
                  <label className="form-check" key={member} title={member}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedMembers.includes(member)}
                      onChange={(event) => setSelectedMembers((current) => event.target.checked
                        ? [...current, member]
                        : current.filter((selected) => selected !== member))}
                    />
                    <span className="form-check-label">Member {member.slice(-6)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <div className="col-12 d-flex align-items-center gap-3">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create team'}
            </button>
            {message && <span role={message.startsWith('Unable') ? 'alert' : 'status'}>{message}</span>}
          </div>
        </form>
      )}
      {!loading && !error && teams.length === 0 && <p>No teams yet.</p>}
      {!loading && !error && teams.length > 0 && (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead><tr><th scope="col">Team</th><th scope="col">Mascot</th><th scope="col">Members</th></tr></thead>
            <tbody>{teams.map((team, index) => (
              <tr key={team._id ?? `${team.name}-${index}`}>
                <th scope="row">{team.name}</th>
                <td>{team.mascot}</td>
                <td>{team.members?.length ?? 0}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

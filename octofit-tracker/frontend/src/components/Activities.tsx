<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { getJson, postJson } from '../api/client.js';

type Activity = {
  _id?: string;
  user: string;
  team: string;
  type: string;
  minutes: number;
  points: number;
  occurredAt?: string;
};

type Team = {
  _id: string;
  name: string;
  members?: string[];
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userId, setUserId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [type, setType] = useState('run');
  const [minutes, setMinutes] = useState('30');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      getJson<{ activities: Activity[] }>('/api/activities'),
      getJson<{ teams: Team[] }>('/api/teams'),
    ])
      .then(([activityResponse, teamResponse]) => {
        if (!active) return;
        const availableTeams = Array.isArray(teamResponse.teams) ? teamResponse.teams : [];
        const availableMembers = [...new Set([
          ...activityResponse.activities.map((activity) => activity.user),
          ...availableTeams.flatMap((team) => team.members ?? []),
        ].filter(Boolean))];
        setActivities(activityResponse.activities);
        setMembers(availableMembers);
        setTeams(availableTeams);
        setUserId(availableMembers[0] ?? '');
        setTeamId(availableTeams[0]?._id ?? '');
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const response = await postJson<{ activity: Activity }>('/api/activities', {
        userId,
        teamId,
        type,
        minutes: Number(minutes),
      });
      setActivities((current) => [response.activity, ...current]);
      setMessage('Activity recorded.');
    } catch {
      setMessage('Unable to record activity. Check the selected member, team, and minutes.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="activities-heading">
      <h2 id="activities-heading" className="h3">Activities</h2>
      {loading && <p role="status">Loading activities...</p>}
      {error && <p role="alert">Unable to load activities. Please try again later.</p>}
      {!loading && !error && (
        <form className="row g-3 mb-4" onSubmit={handleSubmit}>
          <div className="col-12"><h3 className="h5">Record activity</h3></div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="activity-member">Member</label>
            <select className="form-select" id="activity-member" required value={userId} onChange={(event) => setUserId(event.target.value)}>
              <option key="member-placeholder" value="" disabled>Select a member</option>
              {members.map((member) => <option key={member} value={member} title={member}>Member {member.slice(-6)}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="activity-team">Team</label>
            <select className="form-select" id="activity-team" required value={teamId} onChange={(event) => setTeamId(event.target.value)}>
              <option key="team-placeholder" value="" disabled>Select a team</option>
              {teams.map((team) => <option key={team._id ?? team.name} value={team._id ?? ''}>{team.name}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="activity-type">Activity</label>
            <input className="form-control" id="activity-type" required value={type} onChange={(event) => setType(event.target.value)} />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="activity-minutes">Minutes</label>
            <input className="form-control" id="activity-minutes" type="number" min="1" step="any" required value={minutes} onChange={(event) => setMinutes(event.target.value)} />
          </div>
          <div className="col-12 d-flex align-items-center gap-3">
            <button className="btn btn-primary" type="submit" disabled={submitting || !members.length || !teams.length}>
              {submitting ? 'Recording...' : 'Record activity'}
            </button>
            {message && <span role={message.startsWith('Unable') ? 'alert' : 'status'}>{message}</span>}
            {!members.length && <span role="status">No member IDs are available to record an activity.</span>}
          </div>
        </form>
      )}
      {!loading && !error && activities.length === 0 && <p>No activities yet.</p>}
      {!loading && !error && activities.length > 0 && (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead><tr><th scope="col">Activity</th><th scope="col">Minutes</th><th scope="col">Points</th><th scope="col">Date</th></tr></thead>
            <tbody>{activities.map((activity, index) => (
              <tr key={activity._id ?? `${activity.type}-${index}`}>
                <th scope="row">{activity.type}</th>
                <td>{activity.minutes}</td>
                <td>{activity.points}</td>
                <td>{activity.occurredAt ? new Date(activity.occurredAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
=======
import { CapabilityCard } from './CapabilityCard.js';
export default function Activities() {
  return <CapabilityCard title="Activities" description="Track student activity minutes and points." />;
>>>>>>> origin/main
}

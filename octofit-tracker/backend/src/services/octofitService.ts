import { Activity, Team, User, Workout } from '../models/index.js';

type ServiceError = Error & { status: number };

function serviceError(status: number, message: string): ServiceError {
  return Object.assign(new Error(message), { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function listActivities() {
  return Activity.find().sort({ occurredAt: -1 }).lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw serviceError(400, 'Activity must be an object');
  const { userId, teamId, type, minutes } = input;
  if (typeof userId !== 'string' || !User.db.base.isObjectIdOrHexString(userId)
    || typeof teamId !== 'string' || !User.db.base.isObjectIdOrHexString(teamId)) {
    throw serviceError(400, 'Valid userId and teamId are required');
  }
  if (typeof type !== 'string' || !type.trim()) throw serviceError(400, 'Activity type is required');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw serviceError(400, 'Minutes must be a positive number');
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw serviceError(404, 'User or team was not found');

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().sort({ name: 1 }).lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw serviceError(400, 'Team must be an object');
  const { name, mascot } = input;
  if (typeof name !== 'string' || !name.trim()) throw serviceError(400, 'Team name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw serviceError(400, 'Team mascot is required');

  const requestedMembers = input.members ?? [];
  if (!Array.isArray(requestedMembers)
    || requestedMembers.some((member) => typeof member !== 'string' || !User.db.base.isObjectIdOrHexString(member))) {
    throw serviceError(400, 'Members must be an array of valid user IDs');
  }
  const memberIds = [...new Set(requestedMembers as string[])];
  const members = memberIds.length ? await User.find({ _id: { $in: memberIds } }).select('_id').lean() : [];
  if (members.length !== memberIds.length) throw serviceError(404, 'One or more team members were not found');

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: members.map((member) => member._id) });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: unknown; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map((entry) => [String(entry._id), entry.totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(String(team._id)) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw serviceError(404, 'User was not found');

  const [activities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean(),
    Workout.find().lean(),
  ]);
  const activityFocus: Record<string, string> = {
    run: 'endurance',
    cycle: 'endurance',
    swim: 'endurance',
    walk: 'mobility',
    yoga: 'mobility',
    strength: 'strength',
  };
  const goal = user.fitnessGoal.toLowerCase();
  const recentFocus = activities[0] ? activityFocus[activities[0].type.toLowerCase()] : undefined;
  const focus = workouts.some((workout) => workout.focus.toLowerCase() === goal)
    ? goal
    : recentFocus ?? goal;
  const reason = recentFocus
    ? `Recommended for your ${focus} goal and recent ${activities[0].type} activity.`
    : `Recommended to support your ${focus} fitness goal.`;

  return workouts
    .map((workout) => ({ workout, matches: workout.focus.toLowerCase() === focus }))
    .sort((left, right) => Number(right.matches) - Number(left.matches) || left.workout.title.localeCompare(right.workout.title))
    .map(({ workout }) => ({ ...workout, reason }));
}

export { User };

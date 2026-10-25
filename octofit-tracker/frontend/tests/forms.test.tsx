import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App.js';

const memberId = '64b000000000000000000001';
const teamId = '64b000000000000000000002';

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function renderRoute(route: string) {
  return render(<MemoryRouter initialEntries={[route]}><App /></MemoryRouter>);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('OctoFit create workflows', () => {
  it('submits an activity using the selected member, team, type, and minutes', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/activities') && init?.method === 'POST') {
        return response({ activity: {
          _id: '64b000000000000000000003',
          user: memberId,
          team: teamId,
          type: 'run',
          minutes: 45,
          points: 45,
          occurredAt: '2026-01-01T12:00:00.000Z',
        } }, 201);
      }
      if (url.endsWith('/api/activities')) {
        return response({ activities: [{ user: memberId, team: teamId, type: 'cycle', minutes: 20, points: 20 }] });
      }
      if (url.endsWith('/api/teams')) {
        return response({ teams: [{ _id: teamId, name: 'Octocats', mascot: 'Mona', members: [memberId] }] });
      }
      return response({ message: 'Not found' }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    renderRoute('/activities');
    await screen.findByRole('button', { name: 'Record activity' });
    await user.selectOptions(screen.getByLabelText('Member'), memberId);
    await user.selectOptions(screen.getByLabelText('Team'), teamId);
    await user.clear(screen.getByLabelText('Activity'));
    await user.type(screen.getByLabelText('Activity'), 'run');
    await user.clear(screen.getByLabelText('Minutes'));
    await user.type(screen.getByLabelText('Minutes'), '45');
    await user.click(screen.getByRole('button', { name: 'Record activity' }));

    expect(await screen.findByText('Activity recorded.')).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: memberId, teamId, type: 'run', minutes: 45 }),
    })));
  });

  it('creates a team with the submitted name, mascot, and selected members', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/teams') && init?.method === 'POST') {
        return response({ team: { _id: '64b000000000000000000004', name: 'Robocats', mascot: 'Hubot', members: [memberId] } }, 201);
      }
      if (url.endsWith('/api/teams')) {
        return response({ teams: [{ _id: teamId, name: 'Octocats', mascot: 'Mona', members: [memberId] }] });
      }
      return response({ message: 'Not found' }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    renderRoute('/teams');
    await screen.findByRole('button', { name: 'Create team' });
    await user.type(screen.getByLabelText('Team name'), 'Robocats');
    await user.type(screen.getByLabelText('Mascot'), 'Hubot');
    await user.click(screen.getByLabelText(`Member ${memberId.slice(-6)}`));
    await user.click(screen.getByRole('button', { name: 'Create team' }));

    expect(await screen.findByText('Team created.')).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/teams', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Robocats', mascot: 'Hubot', members: [memberId] }),
    })));
  });

  it('announces an activity creation failure accessibly', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/activities') && init?.method === 'POST') return response({ error: 'Invalid activity' }, 400);
      if (url.endsWith('/api/activities')) return response({ activities: [{ user: memberId, team: teamId, type: 'cycle', minutes: 20, points: 20 }] });
      if (url.endsWith('/api/teams')) return response({ teams: [{ _id: teamId, name: 'Octocats', mascot: 'Mona', members: [memberId] }] });
      return response({ message: 'Not found' }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    renderRoute('/activities');
    await user.click(await screen.findByRole('button', { name: 'Record activity' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to record activity/i);
  });

  it('announces a team creation failure accessibly', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/teams') && init?.method === 'POST') return response({ error: 'Invalid team' }, 400);
      if (url.endsWith('/api/teams')) return response({ teams: [] });
      return response({ message: 'Not found' }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    renderRoute('/teams');
    await user.type(await screen.findByLabelText('Team name'), 'Robocats');
    await user.type(screen.getByLabelText('Mascot'), 'Hubot');
    await user.click(screen.getByRole('button', { name: 'Create team' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to create team/i);
  });
});
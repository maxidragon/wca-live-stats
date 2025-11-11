import { useEffect, useMemo, useState } from 'react';
import { gqlFetch } from '../api/client';
import { QUERY_COMPETITION } from '../api/queries';
import { setStoredCompetitionName } from '../utils/storage';

type Round = {
	id: string;
	name: string;
	active: boolean;
	open: boolean;
	number: number;
};

type CompetitionEvent = {
	id: string;
	event: { id: string; name: string };
	rounds: Round[];
};

export function CompetitionDetail(props: {
	competitionId: string;
	onBack: () => void;
	onSelectRound: (round: {
		id: string;
		name: string;
		eventName: string;
	}) => void;
}) {
	const [events, setEvents] = useState<CompetitionEvent[]>([]);
	const [name, setName] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const ac = new AbortController();
		setLoading(true);
		setError(null);
		gqlFetch<{ competition: { name: string; competitionEvents: CompetitionEvent[] } }>(
			QUERY_COMPETITION,
			{ id: props.competitionId },
			ac.signal
		)
			.then((data) => {
				setName(data.competition?.name ?? '');
				setEvents(data.competition?.competitionEvents ?? []);
				if (data.competition?.name) {
					setStoredCompetitionName(props.competitionId, data.competition.name);
				}
			})
			.catch((e) => setError(String(e)))
			.finally(() => setLoading(false));
		return () => ac.abort();
	}, [props.competitionId]);

	const flatRounds = useMemo(
		() =>
			events.flatMap((ce) =>
				ce.rounds.map((r) => ({
					id: r.id,
					name: r.name,
					eventName: ce.event.name,
					active: r.active,
					open: r.open,
					number: r.number
				}))
			),
		[events]
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">{name || 'Competition'}</h1>
				<button
					onClick={props.onBack}
					className="btn btn-outline"
				>
					Back
				</button>
			</div>

			<div className="card">
				<div className="card-header">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Events & Rounds</h2>
						{loading && <span className="text-sm text-gray-600">Loading…</span>}
					</div>
					{error && (
						<div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">
							{error}
						</div>
					)}
				</div>
				<ul className="divide-y">
					{flatRounds.map((r) => (
						<li key={r.id} className="p-4 hover:bg-gray-50">
							<button
								onClick={() =>
									props.onSelectRound({ id: r.id, name: r.name, eventName: r.eventName })
								}
								className="flex w-full items-center justify-between text-left"
							>
								<div>
									<div className="font-medium">
										<span className="text-gray-600">{r.eventName}</span>{' '}
										<span className="text-gray-400">/</span>{' '}
										<span className="text-indigo-700 hover:underline">{r.name}</span>
									</div>
									<div className="text-xs text-gray-700">
										{r.active ? 'Active' : 'Inactive'} · {r.open ? 'Open' : 'Closed'} · #{r.number}
									</div>
								</div>
								<div className="text-sm text-indigo-600">View summary</div>
							</button>
						</li>
					))}
					{!loading && flatRounds.length === 0 && (
						<li className="p-6 text-center text-gray-500">No rounds</li>
					)}
				</ul>
			</div>
		</div>
	);
}



import { useEffect, useMemo, useState } from 'react';
import { gqlFetch } from '../api/client';
import { QUERY_COMPETITIONS } from '../api/queries';

type Competition = {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
};

export function CompetitionSearch(props: {
	onSelect: (competition: { id: string; name: string }) => void;
}) {
	const [fromDate, setFromDate] = useState<string>(() => {
		const d = new Date();
		d.setDate(d.getDate() - 60);
		return d.toISOString().slice(0, 10);
	});
	const [search, setSearch] = useState('');
	const [competitions, setCompetitions] = useState<Competition[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const ac = new AbortController();
		setLoading(true);
		setError(null);
		gqlFetch<{ competitions: Competition[] }>(
			QUERY_COMPETITIONS,
			{ from: fromDate },
			ac.signal
		)
			.then((data) => setCompetitions(data.competitions ?? []))
			.catch((e) => setError(String(e)))
			.finally(() => setLoading(false));
		return () => ac.abort();
	}, [fromDate]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return competitions;
		return competitions.filter((c) => c.name.toLowerCase().includes(q));
	}, [competitions, search]);

	return (
		<div className="space-y-8">
			<div className="card p-5 shadow-md">
				<div className="flex flex-col gap-4 md:flex-row md:items-end">
					<div className="flex-1">
						<label className="block text-sm font-medium text-gray-800">
							From date
						</label>
						<input
							type="date"
							value={fromDate}
							onChange={(e) => setFromDate(e.target.value)}
							className="mt-1 w-full rounded-md border-gray-300 bg-white/90 backdrop-blur focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div className="flex-1">
						<label className="block text-sm font-medium text-gray-800">
							Search competitions
						</label>
						<input
							type="text"
							placeholder="Type competition name…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="mt-1 w-full rounded-md border-gray-300 bg-white/90 backdrop-blur focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div className="md:pb-0">
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => {
								/* no-op: inputs auto-fetch; button for visual symmetry */
							}}
						>
							Search
						</button>
					</div>
				</div>
			</div>

			<div className="card shadow-md">
				<div className="card-header">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">
							Competitions ({filtered.length})
						</h2>
						{loading && <span className="text-sm text-gray-200 md:text-gray-600">Loading…</span>}
					</div>
					{error && (
						<div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">
							{error}
						</div>
					)}
				</div>
				<ul className="divide-y divide-gray-200 bg-white overflow-hidden rounded-b-xl">
					{filtered.map((c) => (
						<li key={c.id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
							<button
								onClick={() => props.onSelect({ id: c.id, name: c.name })}
								className="flex w-full items-center justify-between btn"
							>
								<div>
									<div className="font-medium text-indigo-700 hover:underline text-left">
										{c.name}
									</div>
									<div className="text-sm text-gray-700">
										{c.startDate} → {c.endDate}
									</div>
								</div>
								<div className="text-sm text-gray-700">Open</div>
							</button>
						</li>
					))}
					{!loading && filtered.length === 0 && (
						<li className="p-6 text-center text-gray-700">No competitions</li>
					)}
				</ul>
			</div>
		</div>
	);
}



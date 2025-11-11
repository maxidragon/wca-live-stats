import { useEffect, useMemo, useState } from 'react';
import { gqlFetch } from '../api/client';
import { QUERY_ROUND } from '../api/queries';

type RoundResult = {
	id: string;
	enteredBy: { name: string } | null;
	enteredAt: string | null;
};

export function RoundSummary(props: {
	roundId: string | number;
	roundName: string;
	eventName: string;
	onBack: () => void;
}) {
	const [results, setResults] = useState<RoundResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const ac = new AbortController();
		setLoading(true);
		setError(null);
		gqlFetch<{ round: { results: RoundResult[] } }>(
			QUERY_ROUND,
			{ id: props.roundId },
			ac.signal
		)
			.then((data) => setResults(data.round?.results ?? []))
			.catch((e) => setError(String(e)))
			.finally(() => setLoading(false));
		return () => ac.abort();
	}, [props.roundId]);

	const grouped = useMemo(() => {
		const counter = new Map<string, number>();
		for (const r of results) {
			const key = r.enteredBy?.name?.trim() || 'Unknown';
			counter.set(key, (counter.get(key) ?? 0) + 1);
		}
		const items = Array.from(counter.entries()).map(([name, count]) => ({ name, count }));
		items.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
		const total = results.length;
		const max = items.reduce((m, it) => Math.max(m, it.count), 0);
		return { items, total, max };
	}, [results]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">
						{props.eventName} — {props.roundName}
					</h1>
					<p className="text-sm text-gray-700">
						Scorecards entered per scoretaker (enteredBy)
					</p>
				</div>
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
						<h2 className="text-lg font-semibold">
							Summary ({grouped.total})
						</h2>
						{loading && <span className="text-sm text-gray-600">Loading…</span>}
					</div>
					{error && (
						<div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">
							{error}
						</div>
					)}
				</div>
				<div className="card-body">
					{grouped.items.length === 0 && !loading ? (
						<div className="text-center text-gray-500">No results</div>
					) : (
						<ul className="space-y-2">
							{grouped.items.map((it) => {
								const widthPct =
									grouped.max > 0 ? Math.round((it.count / grouped.max) * 100) : 0;
								return (
									<li
										key={it.name}
										className="rounded-md border bg-gray-50"
									>
										<div className="flex items-center justify-between p-3">
											<div className="min-w-0 flex-1">
												<div className="flex items-center justify-between">
													<div className="truncate font-medium">
														{it.name}
													</div>
													<div className="ml-4 shrink-0 rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
														{it.count}
													</div>
												</div>
												<div className="mt-2 h-2 w-full rounded bg-gray-200">
													<div
														className="h-2 rounded bg-indigo-500"
														style={{ width: `${widthPct}%` }}
													/>
												</div>
											</div>
										</div>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}



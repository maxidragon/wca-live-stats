import { useMemo, useState } from 'react';
import { CompetitionSearch } from './components/CompetitionSearch';
import { CompetitionDetail } from './components/CompetitionDetail';
import { RoundSummary } from './components/RoundSummary';
import { getStoredCompetitionName } from './utils/storage';

type View =
	| { name: 'search' }
	| { name: 'competition'; competitionId: string; competitionName: string }
	| {
			name: 'round';
			competitionId: string;
			competitionName: string;
			roundId: string | number;
			roundName: string;
			eventName: string;
	  };

export default function App() {
	const initialView = useMemo<View>(() => {
		const pathname = window.location.pathname.replace(/\/+$/, '');
		const slug = pathname.startsWith('/') ? pathname.slice(1) : pathname;
		if (slug) {
			const compId = decodeURIComponent(slug);
			const storedName = getStoredCompetitionName(compId) ?? '';
			return { name: 'competition', competitionId: compId, competitionName: storedName };
		}
		return { name: 'search' };
	}, []);

	const [view, setView] = useState<View>(initialView);

	function goToSearch() {
		setView({ name: 'search' });
		history.pushState({}, '', '/');
	}

	function goToCompetition(competitionId: string, competitionName: string) {
		setView({ name: 'competition', competitionId, competitionName });
		const path = `/${encodeURIComponent(competitionId)}`;
		history.pushState({}, '', path);
	}

	function goToRound(args: {
		competitionId: string;
		competitionName: string;
		roundId: string | number;
		roundName: string;
		eventName: string;
	}) {
		setView({ name: 'round', ...args });
		// Keep clean URL (/competitionId) for rounds as requested
	}

	return (
		<div className="min-h-screen w-screen">
			<header className="sticky top-0 z-10 border-b bg-gradient-to-r from-indigo-700 to-indigo-600 text-white shadow">
				<div className="w-full px-8 py-5 flex items-center gap-3">
					<button
						onClick={goToSearch}
						className="font-semibold hover:opacity-90 btn btn-secondary"
						aria-label="Go to search"
					>
						WCA Live Scoretaking Stats
					</button>
					<div className="text-white/80">/</div>
					{view.name !== 'search' && (
						<button
							onClick={() =>
								goToCompetition(
									(view as any).competitionId,
									(view as any).competitionName
								)
							}
							className="hover:underline text-white btn btn-secondary"
						>
							{(view as any).competitionName}
						</button>
					)}
					{view.name === 'round' && (
						<>
							<div className="text-white/80">/</div>
							<div className="text-white font-medium">
								{(view as any).eventName} — {(view as any).roundName}
							</div>
						</>
					)}
				</div>
			</header>
			<main className="w-full px-8 py-10">
				{view.name === 'search' && (
					<CompetitionSearch onSelect={(c) => goToCompetition(c.id, c.name)} />
				)}
				{view.name === 'competition' && (
					<CompetitionDetail
						competitionId={view.competitionId}
						onBack={goToSearch}
						onSelectRound={(round) =>
							goToRound({
								competitionId: view.competitionId,
								competitionName: view.competitionName,
								roundId: round.id,
								roundName: round.name,
								eventName: round.eventName
							})
						}
					/>
				)}
				{view.name === 'round' && (
					<RoundSummary
						roundId={view.roundId}
						roundName={view.roundName}
						eventName={view.eventName}
						onBack={() =>
							goToCompetition(view.competitionId, view.competitionName)
						}
					/>
				)}
			</main>
			<footer className="border-t bg-white">
				<div className="w-full px-8 py-6 text-sm text-gray-700">
					Data source: WCA Live API. This tool is unofficial.
				</div>
			</footer>
		</div>
	);
}
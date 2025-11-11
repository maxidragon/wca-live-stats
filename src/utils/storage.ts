const KEY = 'wca:competitionNames';

function readMap(): Record<string, string> {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return {};
		const data = JSON.parse(raw);
		if (data && typeof data === 'object') return data as Record<string, string>;
		return {};
	} catch {
		return {};
	}
}

function writeMap(map: Record<string, string>) {
	try {
		localStorage.setItem(KEY, JSON.stringify(map));
	} catch {
		// ignore
	}
}

export function getStoredCompetitionName(id: string): string | undefined {
	const map = readMap();
	return map[id];
}

export function setStoredCompetitionName(id: string, name: string) {
	const map = readMap();
	map[id] = name;
	writeMap(map);
}



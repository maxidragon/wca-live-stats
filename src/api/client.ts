const ENDPOINT = 'https://live.worldcubeassociation.org/api';

export type GraphQlResponse<T> = {
	data?: T;
	errors?: Array<{ message: string }>;
};

export async function gqlFetch<T>(
	query: string,
	variables?: Record<string, unknown>,
	signal?: AbortSignal
): Promise<T> {
	const res = await fetch(ENDPOINT, {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({ query, variables }),
		signal
	});
	if (!res.ok) {
		throw new Error(`Network error: ${res.status} ${res.statusText}`);
	}
	const json = (await res.json()) as GraphQlResponse<T>;
	if (json.errors?.length) {
		throw new Error(json.errors.map((e) => e.message).join('; '));
	}
	if (!json.data) {
		throw new Error('Empty response');
	}
	return json.data;
}



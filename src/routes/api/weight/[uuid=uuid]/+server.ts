import { GetUser } from '$db/database';
import type { UserInfo } from '$db/models/users';
import { accountFromUUID } from '$lib/data';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const uuid = params.uuid.replaceAll('-', '');

	if (!uuid || uuid.length !== 32) {
		return new Response(JSON.stringify({ error: 'Not a valid UUID' }), { status: 400 });
	}

	let user = await GetUser(uuid);

	if (!user) {
		// Create a new user
		const account = await accountFromUUID(uuid);

		if (account) {
			return new Response(JSON.stringify({ error: 'Account not found' }), { status: 404 });
		}

		user = await GetUser(uuid);

		if (!user) {
			return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
		}
	}

	const info = user.info as Partial<UserInfo> | undefined;

	if (!info) {
		return new Response(JSON.stringify({ error: 'User info not found' }), { status: 404 });
	}

	return new Response(JSON.stringify(info), { status: 200 });
};

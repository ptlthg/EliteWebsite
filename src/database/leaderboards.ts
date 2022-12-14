import { LEADERBOARD_UPDATE_INTERVAL } from '$lib/constants/data';
import { DBReady, sequelize } from '$db/database';
import { client } from '$db/redis';
export interface LeaderboardEntry {
	ign: string;
	uuid: string;
	profile: string;
	cute_name: string;
	rank: number;
	amount: number;
	face?: {
		base: string;
		overlay: string;
	};
}

export interface LeaderboardPage {
	limit: number;
	property: string;
	name: string;
	default?: true;
}

export interface LeaderboardCategory {
	default?: string;
	name?: string;
	format?: 'number' | 'decimal';
	column: string;
	path: string;
	pages: Record<string, LeaderboardPage>;
}

export type Leaderboard = LeaderboardEntry[];

export const LEADERBOARDS: Partial<Record<string, LeaderboardCategory>> = {
	weight: {
		column: 'info',
		path: '',
		format: 'decimal',
		pages: {
			farming: {
				limit: 1_000,
				property: 'farming.total',
				name: 'Farming Weight',
			},
		},
	},
	skills: {
		column: 'skyblock',
		path: '[profile].member.skills',
		name: 'Skills',
		format: 'decimal',
		pages: {
			combat: {
				limit: 1_000,
				property: 'combat',
				name: 'Combat XP',
			},
			mining: {
				limit: 1_000,
				property: 'mining',
				name: 'Mining XP',
			},
			farming: {
				limit: 1_000,
				property: 'farming',
				name: 'Farming XP',
			},
			foraging: {
				limit: 1_000,
				property: 'foraging',
				name: 'Foraging XP',
			},
			fishing: {
				limit: 1_000,
				property: 'fishing',
				name: 'Fishing XP',
			},
			enchanting: {
				limit: 1_000,
				property: 'enchanting',
				name: 'Enchanting XP',
			},
			alchemy: {
				limit: 1_000,
				property: 'alchemy',
				name: 'Alchemy XP',
			},
			taming: {
				limit: 1_000,
				property: 'taming',
				name: 'Taming XP',
			},
			social: {
				limit: 1_000,
				property: 'social',
				name: 'Social XP',
			},
			runecrafting: {
				limit: 1_000,
				property: 'runecrafting',
				name: 'Runecrafting XP',
			},
			carpentry: {
				limit: 1_000,
				property: 'carpentry',
				name: 'Carpentry XP',
			},
		},
	},
	crops: {
		column: 'skyblock',
		path: '[profile].member.collection',
		name: 'Collections',
		format: 'number',
		pages: {
			cactus: {
				limit: 1_000,
				property: 'CACTUS',
				name: 'Cactus Collection',
			},
			carrot: {
				limit: 1_000,
				property: 'CARROT_ITEM',
				name: 'Carrot Collection',
			},
			cocoa: {
				limit: 1_000,
				property: 'INK_SACK:3',
				name: 'Cocoa Bean Collection',
			},
			melon: {
				limit: 1_000,
				property: 'MELON',
				name: 'Melon Collection',
			},
			mushroom: {
				limit: 1_000,
				property: 'MUSHROOM_COLLECTION',
				name: 'Mushroom Collection',
			},
			netherwart: {
				limit: 1_000,
				property: 'NETHER_STALK',
				name: 'Nether Wart Collection',
			},
			potato: {
				limit: 1_000,
				property: 'POTATO_ITEM',
				name: 'Potato Collection',
			},
			pumpkin: {
				limit: 1_000,
				property: 'PUMPKIN',
				name: 'Pumpkin Collection',
			},
			sugarcane: {
				limit: 1_000,
				property: 'SUGAR_CANE',
				name: 'Sugar Cane Collection',
			},
			wheat: {
				limit: 1_000,
				property: 'WHEAT',
				name: 'Wheat Collection',
			},
		},
	},
	contests: {
		column: 'skyblock',
		path: '[profile].member.jacob',
		name: 'Contests',
		format: 'number',
		pages: {
			count: {
				limit: 1_000,
				property: 'participations',
				name: 'Jacob Contest Participations',
			},
		},
	},
};

export const LeaderboardCategories = Object.keys(LEADERBOARDS);
export const LeaderboardPages = Object.values(LEADERBOARDS).reduce<string[]>((pages, category) => {
	if (!category) return pages;

	if ('pages' in category) {
		pages.push(...Object.keys(category.pages));
	}

	return pages;
}, []);

export async function GetLeaderboardSlice(offset: number, limit: number, category: string, page: string) {
	const cacheKey = `${category}-${page}`;
	const lastUpdated = LastUpdated.get(cacheKey) ?? 0;

	if (Date.now() - lastUpdated > LEADERBOARD_UPDATE_INTERVAL) {
		void FetchLeaderboard(category, page);
	}

	const lb = await client.ZRANGE_WITHSCORES(`${category}:${page}`, offset, offset + limit - 1, { REV: true });

	const entries = await Promise.all(
		lb.map(async (entry) => {
			const { value, score } = entry;
			const [uuid, profile] = value.split(':');

			const [ign, cute_name /*, face*/] = await Promise.all([
				client.GET(`ign:${uuid}`),
				client.GET(`cute_name:${profile}`),
				//client.GET(`face:${uuid}`),
			]);

			// const [base, overlay] = face?.split(':') ?? [];

			return {
				ign,
				cute_name,
				amount: score,
				// face: { base, overlay },
			};
		})
	);

	return entries;
}

const LastUpdated = new Map<string, number>();

export async function FetchLeaderboard(categoryName: string, pageName: string) {
	const category = LEADERBOARDS[categoryName];
	const page = category?.pages[pageName];

	if (!category || !page || !DBReady) return undefined;

	const cacheKey = `${categoryName}-${pageName}`;

	const onProfile = category.column === 'skyblock';
	const path: string[] = category.path.replace('[profile].', '').split('.');

	const exclude = ['info', 'profile', 'account', 'player', 'skyblock', 'createdAt', 'updatedAt'];
	if (!onProfile) exclude.push('skyblock');

	// account->'account'->'face' as face,
	const rawQuery = onProfile
		? `
		SELECT *
		FROM (
			SELECT ign, uuid,
			elem->'${path.join("'->'")}'->'${
				page.property
		  }' as amount, elem->'profile_id' as profile, elem->'cute_name' as cute_name
			FROM users, jsonb_array_elements(skyblock->'profiles') a(elem)
			) sub
		WHERE amount is not null and amount::dec > 0
		ORDER BY amount::dec DESC
		LIMIT ${page.limit};
	`
		: `
		SELECT *
		FROM (
			SELECT ign, uuid,
			elem.val->${category.path ? `'${path.join("'->'")}'->` : ''}'${page.property
				.split('.')
				.join("'->'")}' as amount, elem.profile as profile, elem.val->'cute_name' as cute_name
			FROM users, jsonb_each(info->'profiles') as elem(profile, val)
			WHERE jsonb_typeof(info->'profiles') != 'array'
			) sub
		WHERE amount is not null and amount::dec > 0
		ORDER BY amount::dec DESC
		LIMIT ${page.limit};
	`;

	const raw = await sequelize
		.query(rawQuery, {
			raw: true,
			nest: true,
		})
		.catch((e) => console.log(e));

	if (!raw) return undefined;

	LastUpdated.set(cacheKey, Date.now());

	for (const entry of raw as Leaderboard) {
		const { uuid, ign, profile, cute_name } = entry;
		if (
			!uuid ||
			!ign ||
			!profile ||
			!cute_name ||
			typeof cute_name !== 'string' ||
			typeof ign !== 'string' ||
			typeof uuid !== 'string' ||
			typeof profile !== 'string'
		)
			continue;
		try {
			void client.SET(`cute_name:${profile}`, cute_name);
			void client.SET(`ign:${uuid}`, ign);
		} catch (e) {
			console.log(e);
		}
	}

	void SetLeaderboard(categoryName, pageName, raw as Leaderboard);

	return raw as Leaderboard;
}

export async function SetLeaderboard(category: string, page: string, entries: Leaderboard) {
	try {
		const members = entries
			.filter((entry) => {
				const { amount, uuid, profile } = entry;
				return !isNaN(amount) && uuid && profile && typeof uuid === 'string' && typeof profile === 'string';
			})
			.map((entry) => ({
				value: `${entry.uuid}:${entry.profile}`,
				score: entry.amount,
			}));

		// Transaction to ensure that the leaderboard is updated atomically
		// Leaderboard must be deleted first to ensure that wiped entries are removed
		const transaction = client.MULTI();

		transaction.DEL(`${category}:${page}`);
		transaction.ZADD(`${category}:${page}`, members);

		await transaction.EXEC();
	} catch (e) {
		console.log('Leaderboard Error', e);
	}
}

export async function FetchLeaderboardRank(category: string, page: string, uuid: string, profile: string) {
	try {
		const rank = await client.ZREVRANK(`${category}:${page}`, `${uuid}:${profile}`);

		if (rank === null) return -1;

		return rank + 1;
	} catch (e) {
		return -1;
	}
}

export async function FetchLeaderboardRankings(uuid: string, profile: string) {
	const rankings: Record<string, Record<string, number>> = {};

	for (const category of LeaderboardCategories) {
		const categoryPages = LEADERBOARDS[category]?.pages;

		for (const page of Object.keys(categoryPages ?? {})) {
			const rank = await FetchLeaderboardRank(category, page, uuid, profile);

			if (!rankings[category] as boolean) rankings[category] = {};
			rankings[category][page] = rank;
		}
	}

	return rankings;
}

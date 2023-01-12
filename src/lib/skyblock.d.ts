export type UUID = string;
export type TimestampMills = number;
type Tier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type Skill =
	| 'farming'
	| 'mining'
	| 'combat'
	| 'foraging'
	| 'fishing'
	| 'enchanting'
	| 'alchemy'
	| 'taming'
	| 'carpentry'
	| 'runecrafting'
	| 'social';

export interface RawProfileResponse {
	success: boolean;
	profiles: RawProfileData[];
}

export interface Profiles {
	success: boolean;
	last_fetched: TimestampMills;
	times_fetched: number;
	version: number;
	profiles: ProfileData[];
}

export interface ProfileData {
	profile_id: UUID;
	member: ProfileMember;
	members: MemberData[];
	cute_name: string;
	community_upgrades?: CommunityUpgrades;
	game_mode?: string;
	banking?: BankingData;
	selected: boolean;
	coop: boolean;
	api: APISettings;
}

export interface APISettings {
	skills: APISetting;
	collections: APISetting;
	inventory: APISetting;
	vault: APISetting;
}

export interface APISetting {
	enabled: boolean;
	last_changed: TimestampMills;
	history: {
		enabled: boolean;
		fetched: TimestampMills;
	}[];
}

interface MemberData {
	ign: string;
	uuid: UUID;
}

type CommunityUpgradeNames = 'minion_slots' | 'island_size' | 'guests_count' | 'coins_allowance' | 'coop_slots';

export type CommunityUpgrades = {
	[key in CommunityUpgradeNames]: Tier;
};

export interface RawProfileData {
	profile_id: UUID;
	members: RawProfileMembers;
	cute_name: string;
	community_upgrades?: RawCommunityUpgrades;
	game_mode?: string;
	banking?: BankingData;
	selected: boolean;
}

export type RawProfileMembers = Record<UUID, RawProfileMember>;

export interface ProfileMember {
	inventories: Inventories;
	skills?: ExperienceSkills;
	collection?: Record<string, number>;
	collection_tiers?: Record<string, number>;
	minions: CraftedMinions;
	jacob: JacobData;
	fairy: FairyData;
	pets: PetList;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

export type RartityTiers = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC' | 'SPECIAL' | 'VERY SPECIAL';

export type PetList = {
	exp: number,
	skin: null | string,
	tier: Omit<RartityTiers, 'SPECIAL' | 'VERY SPECIAL'>,
	type: string,
	uuid: null | string,
	active: boolean,
	heldItem: null | string,
	candyUsed: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
}[];

export type SkillName =
	| 'alchemy'
	| 'carpentry'
	| 'combat'
	| 'enchanting'
	| 'farming'
	| 'foraging'
	| 'fishing'
	| 'mining'
	| 'runecrafting'
	| 'social'
	| 'taming';

export type ExperienceSkills = {
	[key in SkillName]: number;
};

export type CropName =
	| 'cactus'
	| 'carrot'
	| 'cocoa'
	| 'melon'
	| 'mushroom'
	| 'netherwart'
	| 'potato'
	| 'pumpkin'
	| 'sugarcane'
	| 'wheat';

export type ContestData = {
	[key in CropName]: JacobContest[];
};

export type CraftedMinions = Record<string, number>;
export interface JacobContest {
	collected: number;
	timestamp: number;
	position?: number;
	participants?: number;
	medal?: 'gold' | 'silver' | 'bronze';
}

export interface JacobData {
	medals: MedalInventory;
	earned_medals: MedalInventory;
	perks: FarmingPerks;
	participations: number;
	contests: ContestData;
}

export interface FairyData {
	souls_collected: number;
	souls: number;
	exchanges: number;
}

export interface Inventories {
	player?: ItemStack[];
	armor: ItemStack[];
	ender_chest?: ItemStack[];
	backpacks?: ItemStack[][];
	talismans?: ItemStack[];
	equipment?: ItemStack[];
	wardrobe?: ItemStack[];
	vault?: ItemStack[];
	potions?: ItemStack[];
	quiver?: ItemStack[];
}

export interface RawProfileMember {
	inv_armor: NBTData;
	experience_skill_alchemy: number;
	experience_skill_carpentry: number;
	experience_skill_combat: number;
	experience_skill_enchanting: number;
	experience_skill_farming: number;
	experience_skill_fishing: number;
	experience_skill_foraging: number;
	experience_skill_mining: number;
	experience_skill_runecrafting: number;
	experience_skill_taming: number;
	collection: Record<string, number>;
	crafted_generators?: string[];
	jacob2?: RawAPIJacobData;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

export interface NBTData {
	type: number;
	data: {
		type: string;
		value: ItemStack[];
	};
}

export interface ItemStack {
	Count: {
		type: string;
		value: number;
	};
	Damage: {
		type: string;
		value: number;
	};
	id: {
		type: string;
		value: number;
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	tag: any;
}

export interface RawCommunityUpgrades {
	upgrade_states: CommunityUpgradeState[];
}

export interface CommunityUpgradeState {
	upgrade: CommunityUpgradeNames;
	tier: Tier;
	started_ms: TimestampMills;
	started_by: UUID;
	claimed_ms: TimestampMills;
	claimed_by: UUID;
	fasttracked: boolean;
}

export interface BankingData {
	balance: number;
	transactions?: BankingTransaction[];
}

export interface BankingTransaction {
	amount: number;
	timestamp: TimestampMills;
	action: 'DEPOSIT' | 'WITHDRAW';
	initiator_name: `§b${string}` | 'Bank Interest';
}

export interface MedalInventory {
	bronze: number;
	silver: number;
	gold: number;
}

export interface FarmingPerks {
	double_drops: number;
	farming_level_cap: number;
}

export type FarmingContestScores = {
	[key in CropString]: FarmingContest;
};

export type ContestCrop =
	| 'cactus'
	| 'carrot'
	| 'cocoa'
	| 'melon'
	| 'mushroom'
	| 'netherwart'
	| 'potato'
	| 'pumpkin'
	| 'sugarcane'
	| 'wheat';

interface RawAPIProfiles {
	success: boolean;
	profiles: RawAPIProfile[];
}

interface RawAPIProfile {
	profile_id: string;
	members: Record<string, RawAPIMember>;
	cute_name: string;
	game_mode: string; // Probably will use soon
	[key: string]: unknown; // Not using anything else
}

interface RawAPIMember {
	experience_skill_farming: number;
	collection: Record<string, number>;
	crafted_generators: string[];
	jacob2: RawAPIJacobData;
	[key: string]: unknown; // Not using anything else
}

interface RawAPIJacobData {
	medals_inv: MedalInventory;
	perks: FarmingPerks;
	talked: boolean;
	contests: Record<string, FarmingContest>;
}

interface FarmingContest {
	collected: number;
	claimed_rewards?: true;
	claimed_position?: number;
	claimed_participants?: number;
	claimed_medal?: 'bronze' | 'silver' | 'gold';
}

export interface PlayerInfo {
	success: boolean;
	last_fetched: TimestampMills;
	version: number;
	player: PlayerData;
}

export interface PlayerData {
	firstLogin: number;
	lastLogin: number;
	karma: number;
	rank?: RankName;
	newPackageRank?: RankName;
	monthlyPackageRank?: 'NONE' | 'SUPERSTAR';
	rankPlusColor?: PlusColor;
	socialMedia?: {
		links?: {
			DISCORD?: string;
			HYPIXEL?: string;
			[key: string]: string;
		};
	};
	skyblock_extra?: {
		ozanne_coins?: number;
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

export interface AccountInfo {
	success: boolean;
	last_fetched: TimestampMills;
	version: number;
	account: AccountData;
}

export interface AccountData {
	id: string;
	name: string;
	properties: {
		name: string;
		value: string;
	}[];
	face: {
		base: string;
		overlay: string;
	};
}

export type PlusColor =
	| 'BLACK'
	| 'DARK_BLUE'
	| 'DARK_GREEN'
	| 'DARK_AQUA'
	| 'DARK_RED'
	| 'DARK_PURPLE'
	| 'GOLD'
	| 'GRAY'
	| 'DARK_GRAY'
	| 'BLUE'
	| 'GREEN'
	| 'AQUA'
	| 'RED'
	| 'LIGHT_PURPLE'
	| 'YELLOW'
	| 'WHITE';

// Doesn't include 'NONE'
export type RankName =
	| 'OWNER'
	| 'ADMIN'
	| 'GAME_MASTER'
	| 'YOUTUBER'
	| 'SUPERSTAR'
	| 'MVP_PLUS'
	| 'MVP'
	| 'VIP_PLUS'
	| 'VIP'
	| 'MAYOR'
	| 'MINISTER'
	| 'PIG+++';

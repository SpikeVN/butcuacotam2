import { sceneIs, script } from '../../../engine/script';

const STORAGE_KEY = 'maze_unlocked_level';
const MIN_LEVEL = 1;
const MAX_LEVEL = 3;

function clampLevel(level: number): number {
	return Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Math.floor(level)));
}

export function getUnlockedLevel(): number {
	// First check script stage for level completion
	if (script.path === "game2_saves") {
		if (sceneIs(2, "r3_complete")) return 3;
		if (sceneIs(2, "r2_complete")) return 3; // R2 complete means R3 is unlocked
		if (sceneIs(2, "r1_complete")) return 2; // R1 complete means R2 is unlocked
	}

	const rawValue = window.localStorage.getItem(STORAGE_KEY);
	if (!rawValue) {
		return MIN_LEVEL;
	}

	const parsed = Number(rawValue);
	if (!Number.isFinite(parsed)) {
		return MIN_LEVEL;
	}

	return clampLevel(parsed);
}

export function isLevelUnlocked(level: number): boolean {
	return clampLevel(level) <= getUnlockedLevel();
}

export function unlockLevel(level: number): void {
	const current = getUnlockedLevel();
	const next = Math.max(current, clampLevel(level));
	window.localStorage.setItem(STORAGE_KEY, String(next));
}

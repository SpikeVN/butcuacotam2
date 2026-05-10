import * as Phaser from 'phaser';

export type ChaserConfig = {
	maze: number[][];
	cellSize: number;
	offsetX: number;
	offsetY: number;
	startCol: number;
	startRow: number;
	speed?: number;
};

export function findPath(
	startCol: number,
	startRow: number,
	goalCol: number,
	goalRow: number,
	maze: number[][]
): { x: number; y: number }[] {
	if (!maze.length || !maze[0]?.length) {
		return [];
	}

	const rows = maze.length;
	const cols = maze[0].length;

	const isWalkable = (col: number, row: number): boolean => {
		return row >= 0 && row < rows && col >= 0 && col < cols && maze[row][col] !== 1;
	};

	if (!isWalkable(startCol, startRow) || !isWalkable(goalCol, goalRow)) {
		return [];
	}

	const getKey = (col: number, row: number): string => `${col},${row}`;
	const heuristic = (col: number, row: number): number => Math.abs(col - goalCol) + Math.abs(row - goalRow);

	const openSet: { col: number; row: number }[] = [{ col: startCol, row: startRow }];
	const cameFrom = new Map<string, string>();
	const gScore = new Map<string, number>([[getKey(startCol, startRow), 0]]);
	const fScore = new Map<string, number>([[getKey(startCol, startRow), heuristic(startCol, startRow)]]);

	const reconstructPath = (currentKey: string): { x: number; y: number }[] => {
		const path: { x: number; y: number }[] = [];
		let key: string | undefined = currentKey;

		while (key) {
			const [colStr, rowStr] = key.split(',');
			path.push({ x: Number(colStr), y: Number(rowStr) });
			key = cameFrom.get(key);
		}

		return path.reverse();
	};

	while (openSet.length > 0) {
		let currentIndex = 0;
		let current = openSet[0];
		let currentF = fScore.get(getKey(current.col, current.row)) ?? Infinity;

		for (let i = 1; i < openSet.length; i++) {
			const candidate = openSet[i];
			const candidateF = fScore.get(getKey(candidate.col, candidate.row)) ?? Infinity;
			if (candidateF < currentF) {
				current = candidate;
				currentIndex = i;
				currentF = candidateF;
			}
		}

		const currentKey = getKey(current.col, current.row);
		if (current.col === goalCol && current.row === goalRow) {
			return reconstructPath(currentKey);
		}

		openSet.splice(currentIndex, 1);

		const neighbors = [
			{ col: current.col + 1, row: current.row },
			{ col: current.col - 1, row: current.row },
			{ col: current.col, row: current.row + 1 },
			{ col: current.col, row: current.row - 1 }
		];

		for (const neighbor of neighbors) {
			if (!isWalkable(neighbor.col, neighbor.row)) {
				continue;
			}

			const neighborKey = getKey(neighbor.col, neighbor.row);
			const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;

			if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
				cameFrom.set(neighborKey, currentKey);
				gScore.set(neighborKey, tentativeG);
				fScore.set(neighborKey, tentativeG + heuristic(neighbor.col, neighbor.row));

				if (!openSet.some(item => item.col === neighbor.col && item.row === neighbor.row)) {
					openSet.push(neighbor);
				}
			}
		}
	}

	return [];
}

export class ChaserController {
	public readonly body: Phaser.GameObjects.Rectangle;

	private readonly scene: Phaser.Scene;
	private readonly maze: number[][];
	private readonly cellSize: number;
	private readonly offsetX: number;
	private readonly offsetY: number;
	private readonly speed: number;
	private recalcTimer = 0;
	private readonly recalcInterval = 250; // ms between path recalculations
	private path: { x: number; y: number }[] = [];
	private pathIndex = 0;
	private targetX = 0;
	private targetY = 0;
	private _isActive = false;
	private isFrozen = false;
	private lastGoalCol = -1;
	private lastGoalRow = -1;

	// Visual layers
	private visualContainer: Phaser.GameObjects.Container;

	constructor(scene: Phaser.Scene, config: ChaserConfig) {
		this.scene = scene;
		this.maze = config.maze;
		this.cellSize = config.cellSize;
		this.offsetX = config.offsetX;
		this.offsetY = config.offsetY;
		this.speed = (config.speed ?? 5) * this.cellSize;

		const startX = this.offsetX + config.startCol * this.cellSize + this.cellSize / 2;
		const startY = this.offsetY + config.startRow * this.cellSize + this.cellSize / 2;

		const bodySize = Math.max(8, Math.floor(this.cellSize * 0.6));
		this.body = scene.add.rectangle(startX, startY, bodySize, bodySize, 0x000000, 0);

		// ── Phantom/wraith visual ───────────────────────────────────────
		const r = bodySize * 0.55;
		this.visualContainer = scene.add.container(startX, startY);

		// Outer menacing aura
		const aura = scene.add.graphics();
		aura.fillStyle(0xdc2626, 0.12);
		aura.fillCircle(0, 0, r * 2.0);
		this.visualContainer.add(aura);

		// Body glow
		const glow = scene.add.graphics();
		glow.fillStyle(0xef4444, 0.25);
		glow.fillCircle(0, 0, r * 1.4);
		this.visualContainer.add(glow);

		// Main body (dark wraith shape)
		const main = scene.add.graphics();
		main.fillStyle(0x2d0a0a, 1);
		main.fillCircle(0, 0, r);
		main.lineStyle(1.5, 0xdc2626, 0.6);
		main.strokeCircle(0, 0, r);
		this.visualContainer.add(main);

		// Left eye (red glowing)
		const eyeOff = r * 0.30;
		const eyeR = r * 0.20;
		const leftEye = scene.add.graphics();
		leftEye.fillStyle(0xff4444, 0.95);
		leftEye.fillCircle(-eyeOff, -r * 0.10, eyeR);
		leftEye.fillStyle(0xffffff, 0.9);
		leftEye.fillCircle(-eyeOff, -r * 0.10, eyeR * 0.4);
		this.visualContainer.add(leftEye);

		// Right eye (red glowing)
		const rightEye = scene.add.graphics();
		rightEye.fillStyle(0xff4444, 0.95);
		rightEye.fillCircle(eyeOff, -r * 0.10, eyeR);
		rightEye.fillStyle(0xffffff, 0.9);
		rightEye.fillCircle(eyeOff, -r * 0.10, eyeR * 0.4);
		this.visualContainer.add(rightEye);

		// Angry brow marks
		const brows = scene.add.graphics();
		brows.lineStyle(1.5, 0x991b1b, 0.8);
		brows.beginPath();
		brows.moveTo(-eyeOff - eyeR, -r * 0.35);
		brows.lineTo(-eyeOff + eyeR * 0.4, -r * 0.28);
		brows.strokePath();
		brows.beginPath();
		brows.moveTo(eyeOff + eyeR, -r * 0.35);
		brows.lineTo(eyeOff - eyeR * 0.4, -r * 0.28);
		brows.strokePath();
		this.visualContainer.add(brows);

		// Breathing/pulsing aura animation
		scene.tweens.add({
			targets: aura,
			scaleX: { from: 0.85, to: 1.15 },
			scaleY: { from: 0.85, to: 1.15 },
			alpha: { from: 0.5, to: 1 },
			duration: 900,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.InOut',
		});

		// Eye flicker
		scene.tweens.add({
			targets: [leftEye, rightEye],
			alpha: { from: 0.7, to: 1 },
			duration: 400,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.InOut',
		});

		this.targetX = startX;
		this.targetY = startY;
	}

	update(delta: number, playerPixelX: number, playerPixelY: number): void {
		if (!this._isActive) {
			return;
		}

		if (this.isFrozen) {
			return;
		}

		this.recalcTimer += delta;
		const goalCol = Math.floor((playerPixelX - this.offsetX) / this.cellSize);
		const goalRow = Math.floor((playerPixelY - this.offsetY) / this.cellSize);

		// Recalculate path periodically or when goal cell changes
		const goalChanged = goalCol !== this.lastGoalCol || goalRow !== this.lastGoalRow;
		const needsRecalc = !this.path.length || this.pathIndex >= this.path.length;

		if (needsRecalc || (this.recalcTimer >= this.recalcInterval && goalChanged)) {
			this.recalcTimer = 0;
			this.lastGoalCol = goalCol;
			this.lastGoalRow = goalRow;

			const startCol = Math.floor((this.body.x - this.offsetX) / this.cellSize);
			const startRow = Math.floor((this.body.y - this.offsetY) / this.cellSize);
			this.calculatePath(startCol, startRow, goalCol, goalRow);
		}

		const dt = delta / 1000;
		this.moveAlongPath(dt);

		// Sync visual with body
		this.visualContainer.setPosition(this.body.x, this.body.y);
	}

	getPathDistanceTo(playerCol: number, playerRow: number): number {
		if (!this.path.length || this.pathIndex >= this.path.length) {
			return Infinity;
		}

		const pathEnd = this.path[this.path.length - 1];
		if (pathEnd.x !== playerCol || pathEnd.y !== playerRow) {
			return Infinity;
		}

		return Math.max(0, this.path.length - this.pathIndex);
	}

	activate(): void {
		this._isActive = true;
	}

	public get isActive(): boolean {
		return this._isActive;
	}

	setFrozen(frozen: boolean): void {
		this.isFrozen = frozen;
	}

	destroy(): void {
		this.visualContainer.destroy();
		this.body.destroy();
	}

	private calculatePath(startCol: number, startRow: number, goalCol: number, goalRow: number): void {
		const newPath = findPath(startCol, startRow, goalCol, goalRow, this.maze);
		if (!newPath.length) {
			return; // keep old path rather than clearing, avoids stalling
		}

		this.path = newPath;
		this.pathIndex = 1;
		this.updateTargetFromPath();
	}

	private updateTargetFromPath(): void {
		if (this.pathIndex >= this.path.length || this.pathIndex < 0) {
			return; // keep current target, don't snap
		}

		const next = this.path[this.pathIndex];
		this.targetX = this.offsetX + next.x * this.cellSize + this.cellSize / 2;
		this.targetY = this.offsetY + next.y * this.cellSize + this.cellSize / 2;
	}

	private moveAlongPath(dt: number): void {
		if (!this.path.length || this.pathIndex >= this.path.length) {
			return;
		}

		let remaining = this.speed * dt;

		while (remaining > 0 && this.pathIndex < this.path.length) {
			const dx = this.targetX - this.body.x;
			const dy = this.targetY - this.body.y;
			const distance = Math.hypot(dx, dy);

			if (distance <= 0.5) {
				this.body.setPosition(this.targetX, this.targetY);
				this.pathIndex += 1;
				this.updateTargetFromPath();
				continue;
			}

			if (remaining >= distance) {
				this.body.setPosition(this.targetX, this.targetY);
				remaining -= distance;
				this.pathIndex += 1;
				this.updateTargetFromPath();
				continue;
			}

			const ratio = remaining / distance;
			this.body.setPosition(this.body.x + dx * ratio, this.body.y + dy * ratio);
			remaining = 0;
		}
	}
}

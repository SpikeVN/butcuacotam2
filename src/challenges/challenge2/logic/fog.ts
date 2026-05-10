import * as Phaser from 'phaser';
import type { LightState } from './green_red_light';

export type FogConfig = {
	x: number;
	y: number;
	width: number;
	height: number;
	strongness?: number;
	revealRadius?: number;
};

export class FogController {
	private readonly fogGraphics: Phaser.GameObjects.Graphics;
	private readonly strongness: number;
	private readonly baseRevealRadius: number;
	private readonly x: number;
	private readonly y: number;
	private readonly width: number;
	private readonly height: number;
	private readonly lightRevealRadius: number;
	private currentAlpha = 0;
	private currentRadius = 0;

	constructor(scene: Phaser.Scene, config: FogConfig) {
		this.x = config.x;
		this.y = config.y;
		this.width = config.width;
		this.height = config.height;
		this.strongness = Phaser.Math.Clamp(config.strongness ?? 0.8, 0.05, 1);
		this.baseRevealRadius = config.revealRadius ?? 90;
		this.lightRevealRadius = this.baseRevealRadius;

		this.fogGraphics = scene.add.graphics();
		this.fogGraphics.setDepth(212);

		this.currentAlpha = 1;
		this.currentRadius = this.baseRevealRadius;
	}

	public update(delta: number, state: LightState, playerX: number, playerY: number, lightX: number, lightY: number): void {
		const stateMultiplier = state === 'green' ? 1 : state === 'yellow' ? 0.72 : 0.45;
		const nonGreenAlpha = Phaser.Math.Linear(0.88, 1, this.strongness) * stateMultiplier;
		const targetAlpha = state === 'green' ? 1 : nonGreenAlpha;
		const radiusScale = state === 'green' ? 1.1 : state === 'yellow' ? 2.35 : 2.5;
		const targetRadius = this.baseRevealRadius * radiusScale;

		const lerpFactor = Phaser.Math.Clamp(delta / 220, 0, 1);
		this.currentAlpha = Phaser.Math.Linear(this.currentAlpha, targetAlpha, lerpFactor);
		this.currentRadius = Phaser.Math.Linear(this.currentRadius, targetRadius, lerpFactor);

		const playerCenterX = Phaser.Math.Clamp(playerX, this.x, this.x + this.width);
		const playerCenterY = Phaser.Math.Clamp(playerY, this.y, this.y + this.height);
		const lightCenterX = Phaser.Math.Clamp(lightX, this.x, this.x + this.width);
		const lightCenterY = Phaser.Math.Clamp(lightY, this.y, this.y + this.height);
		const playerRadius = this.currentRadius * 0.95;
		const lightRadius = this.lightRevealRadius;

		this.fogGraphics.clear();
		this.fogGraphics.fillStyle(0x020617, this.currentAlpha);
		const mazeTop = this.y;
		const mazeBottom = this.y + this.height;
		const mazeLeft = this.x;
		const mazeRight = this.x + this.width;

		const stripHeight = 4;

		for (let stripY = mazeTop; stripY < mazeBottom; stripY += stripHeight) {
			const h = Math.min(stripHeight, mazeBottom - stripY);
			const stripCenterY = stripY + h * 0.5;
			const revealIntervals: Array<[number, number]> = [];

			this.collectRevealInterval(revealIntervals, stripCenterY, playerCenterX, playerCenterY, playerRadius, mazeLeft, mazeRight);
			this.collectRevealInterval(revealIntervals, stripCenterY, lightCenterX, lightCenterY, lightRadius, mazeLeft, mazeRight);

			if (revealIntervals.length === 0) {
				this.fogGraphics.fillRect(mazeLeft, stripY, this.width, h);
				continue;
			}

			revealIntervals.sort((left, right) => left[0] - right[0]);

			const mergedIntervals: Array<[number, number]> = [];
			for (const interval of revealIntervals) {
				const lastInterval = mergedIntervals[mergedIntervals.length - 1];
				if (!lastInterval || interval[0] > lastInterval[1]) {
					mergedIntervals.push([...interval]);
					continue;
				}

				lastInterval[1] = Math.max(lastInterval[1], interval[1]);
			}

			let currentX = mazeLeft;
			for (const [revealLeft, revealRight] of mergedIntervals) {
				if (revealLeft > currentX) {
					this.fogGraphics.fillRect(currentX, stripY, revealLeft - currentX, h);
				}

				currentX = Math.max(currentX, revealRight);
			}

			if (currentX < mazeRight) {
				this.fogGraphics.fillRect(currentX, stripY, mazeRight - currentX, h);
			}
		}
	}

	private collectRevealInterval(
		intervals: Array<[number, number]>,
		stripCenterY: number,
		centerX: number,
		centerY: number,
		radius: number,
		mazeLeft: number,
		mazeRight: number
	): void {
		const dy = stripCenterY - centerY;
		const inside = radius * radius - dy * dy;

		if (inside <= 0) {
			return;
		}

		const dx = Math.sqrt(inside);
		const left = Phaser.Math.Clamp(centerX - dx, mazeLeft, mazeRight);
		const right = Phaser.Math.Clamp(centerX + dx, mazeLeft, mazeRight);

		if (right > left) {
			intervals.push([left, right]);
		}
	}

	public destroy(): void {
		this.fogGraphics.destroy();
	}
}

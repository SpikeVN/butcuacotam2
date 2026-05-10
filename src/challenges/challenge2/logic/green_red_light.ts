import * as Phaser from 'phaser';

export type GreenRedLightConfig = {
	x?: number;
	y?: number;
	radius?: number;
	ambientX?: number;
	ambientY?: number;
	ambientWidth?: number;
	ambientHeight?: number;
	greenDurationMs?: number;
	redDurationMs?: number;
	durationVariance?: number;
	redGraceMs?: number;
	loseSpeedThreshold?: number;
	onLose?: () => void;
};

export type LightState = 'green' | 'yellow' | 'red';

export class GreenRedLightController {
	public readonly indicator: Phaser.GameObjects.Arc;

	private readonly roomDarkness: Phaser.GameObjects.Rectangle;
	private readonly ambientWash: Phaser.GameObjects.Rectangle;
	private readonly ambientGlow: Phaser.GameObjects.Arc;
	private readonly auraOuter: Phaser.GameObjects.Arc;
	private readonly auraInner: Phaser.GameObjects.Arc;
	private readonly highlight: Phaser.GameObjects.Arc;
	private readonly greenBaseDurationMs: number;
	private readonly redBaseDurationMs: number;
	private readonly durationVariance: number;
	private readonly redGraceMs: number;
	private readonly yellowDurationMs = 800;
	private readonly loseSpeedThreshold: number;
	private readonly onLose?: () => void;
	private state: LightState = 'green';
	private stateElapsedMs = 0;
	private currentStateDurationMs = 0;
	private hasLost = false;

	constructor(scene: Phaser.Scene, config: GreenRedLightConfig = {}) {
		this.greenBaseDurationMs = config.greenDurationMs ?? 2200;
		this.redBaseDurationMs = config.redDurationMs ?? 1800;
		this.durationVariance = Phaser.Math.Clamp(config.durationVariance ?? 0.35, 0, 0.95);
		this.redGraceMs = config.redGraceMs ?? 400;
		this.loseSpeedThreshold = config.loseSpeedThreshold ?? 1;
		this.onLose = config.onLose;

		const radius = config.radius ?? 18;
		const x = config.x ?? scene.scale.width - radius - 18;
		const y = config.y ?? radius + 18;

		this.roomDarkness = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 0.42);
		this.roomDarkness.setOrigin(0, 0);
		this.roomDarkness.setDepth(200);

		const ambientX = config.ambientX ?? 0;
		const ambientY = config.ambientY ?? 0;
		const ambientWidth = config.ambientWidth ?? scene.scale.width;
		const ambientHeight = config.ambientHeight ?? scene.scale.height;

		this.ambientWash = scene.add.rectangle(ambientX, ambientY, ambientWidth, ambientHeight, 0x4ade80, 0.09);
		this.ambientWash.setOrigin(0, 0);
		this.ambientWash.setBlendMode(Phaser.BlendModes.ADD);
		this.ambientWash.setDepth(201);

		this.ambientGlow = scene.add.circle(x, y, radius * 18, 0x4ade80, 0.05);
		this.ambientGlow.setBlendMode(Phaser.BlendModes.ADD);
		this.ambientGlow.setDepth(202);
		this.ambientGlow.setStrokeStyle(0);

		this.auraOuter = scene.add.circle(x, y, radius * 1.9, 0x22c55e, 0.08);
		this.auraOuter.setBlendMode(Phaser.BlendModes.ADD);
		this.auraOuter.setDepth(203);
		this.auraOuter.setStrokeStyle(0);

		this.auraInner = scene.add.circle(x, y, radius * 1.25, 0x22c55e, 0.22);
		this.auraInner.setBlendMode(Phaser.BlendModes.ADD);
		this.auraInner.setDepth(204);
		this.auraInner.setStrokeStyle(0);

		this.indicator = scene.add.circle(x, y, radius, 0x22c55e, 1);
		this.indicator.setDepth(205);
		this.indicator.setStrokeStyle(3, 0xf8fafc, 0.55);

		this.highlight = scene.add.circle(x - radius * 0.32, y - radius * 0.34, radius * 0.18, 0xf8fafc, 0.9);
		this.highlight.setBlendMode(Phaser.BlendModes.ADD);
		this.highlight.setDepth(206);
		this.highlight.setStrokeStyle(0);
		this.currentStateDurationMs = this.randomizedDuration(this.state);
	}

	public destroy(): void {
		this.roomDarkness.destroy();
		this.ambientWash.destroy();
		this.ambientGlow.destroy();
		this.auraOuter.destroy();
		this.auraInner.destroy();
		this.indicator.destroy();
		this.highlight.destroy();
	}

	public getState(): LightState {
		return this.state;
	}

	update(delta: number, playerSpeed: number): void {
		if (this.hasLost) {
			return;
		}

		this.stateElapsedMs += delta;
		this.advanceStateIfNeeded();
		this.refreshIndicator();

		if (this.state === 'red' && this.stateElapsedMs >= this.redGraceMs && playerSpeed > this.loseSpeedThreshold) {
			this.hasLost = true;
			this.onLose?.();
		}
	}

	private advanceStateIfNeeded(): void {
		if (this.stateElapsedMs < this.currentStateDurationMs) {
			return;
		}

		if (this.state === 'green') {
			this.state = 'yellow';
		} else if (this.state === 'yellow') {
			this.state = 'red';
		} else {
			this.state = 'green';
		}
		this.stateElapsedMs = 0;
		this.currentStateDurationMs = this.randomizedDuration(this.state);
	}

	private randomizedDuration(state: LightState): number {
		if (state === 'yellow') {
			return this.yellowDurationMs;
		}

		const baseDuration = state === 'green' ? this.greenBaseDurationMs : this.redBaseDurationMs;
		const spread = baseDuration * this.durationVariance;
		const randomized = Phaser.Math.Between(
			Math.max(1, Math.floor(baseDuration - spread)),
			Math.max(1, Math.ceil(baseDuration + spread))
		);

		if (state === 'green') {
			return Phaser.Math.Clamp(randomized, 4000, 10000);
		}

		return Phaser.Math.Clamp(randomized, 1, 1500);
	}

	private refreshIndicator(): void {
		const isGreen = this.state === 'green';
		const isYellow = this.state === 'yellow';
		const coreColor = isGreen ? 0x22c55e : isYellow ? 0xfacc15 : 0xef4444;
		const glowColor = isGreen ? 0x4ade80 : isYellow ? 0xfde047 : 0xf87171;
		const shadowAlpha = isGreen ? 0.26 : isYellow ? 0.22 : 0.18;
		const roomAlpha = isGreen ? 0.38 : isYellow ? 0.44 : 0.5;

		this.roomDarkness.setAlpha(roomAlpha);

		this.ambientWash.setFillStyle(glowColor, isGreen ? 0.09 : 0.06);
		this.ambientWash.setAlpha(isGreen ? 1 : isYellow ? 0.95 : 0.9);

		this.ambientGlow.setFillStyle(glowColor, isGreen ? 0.06 : 0.045);
		this.ambientGlow.setAlpha(isGreen ? 1 : isYellow ? 0.9 : 0.82);

		this.auraOuter.setFillStyle(glowColor, 0.07);
		this.auraOuter.setAlpha(isGreen ? 0.9 : isYellow ? 0.85 : 0.8);

		this.auraInner.setFillStyle(glowColor, 0.18);
		this.auraInner.setAlpha(isGreen ? 1 : isYellow ? 0.96 : 0.92);

		this.indicator.setFillStyle(coreColor, 1);
		this.indicator.setStrokeStyle(3, 0xf8fafc, shadowAlpha + 0.12);
		this.indicator.setAlpha(this.state === 'red' && this.stateElapsedMs < this.redGraceMs ? 0.92 : 1);

		this.highlight.setAlpha(isGreen ? 0.95 : 0.8);
	}
}

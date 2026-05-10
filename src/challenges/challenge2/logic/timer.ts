import * as Phaser from 'phaser';

export type CountdownTimerConfig = {
	durationMs?: number;
	x?: number;
	y?: number;
	onTimeout?: () => void;
};

export class CountdownTimerController {
	private readonly durationMs: number;
	private readonly onTimeout?: () => void;
	private readonly label: Phaser.GameObjects.Text;
	private remainingMs: number;
	private isFinished = false;

	constructor(scene: Phaser.Scene, config: CountdownTimerConfig = {}) {
		this.durationMs = config.durationMs ?? 120000;
		this.remainingMs = this.durationMs;
		this.onTimeout = config.onTimeout;

		this.label = scene.add.text(config.x ?? 16, config.y ?? 14, this.formatTime(this.remainingMs), {
			fontSize: '24px',
			color: '#f8fafc',
			fontFamily: "Bricolage Grotesque"
		});
		this.label.setDepth(260);
	}

	public update(delta: number): void {
		if (this.isFinished) {
			return;
		}

		this.remainingMs = Math.max(0, this.remainingMs - delta);
		this.label.setText(this.formatTime(this.remainingMs));

		if (this.remainingMs === 0) {
			this.isFinished = true;
			this.onTimeout?.();
		}
	}

	public destroy(): void {
		this.label.destroy();
	}

	private formatTime(ms: number): string {
		const totalSeconds = Math.ceil(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `Thời gian: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}
}

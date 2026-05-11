import * as Phaser from 'phaser';
import { generateMaze } from '../maze_gen';
import { PlayerController } from '../logic/player';
import { GreenRedLightController } from '../logic/green_red_light';
import { CountdownTimerController } from '../logic/timer';
import { FogController } from '../logic/fog';
import { unlockLevel } from '../logic/progress';
import { showFailMenu } from '../Menu/fail_menu';
import { showWinMenu } from '../Menu/win_menu';
import { showPauseMenu } from '../Menu/pause_menu';
import { showIntroOverlay } from '../Menu/intro_overlay';
import { saveUserdata, setCheckpoint } from '../../../engine/userdata';
import { switchPath } from '../../../engine/script';

const LEVEL3_PLAYER_MOVEMENT = {
	acceleration: 30,
	maxSpeed: 55,
	inertiaCoefficient: 0.9
};

const HUD_GAP_HEIGHT = 84;

export default class Level3 extends Phaser.Scene {
	private player?: PlayerController;
	private maze: number[][] = [];
	private cellSize = 0;
	private mazeCols = 0;
	private mazeRows = 0;
	private offsetX = 0;
	private offsetY = 0;
	private isIntro = true;
	private isFailed = false;
	private isWon = false;
	private failOverlay?: Phaser.GameObjects.Container;
	private winOverlay?: Phaser.GameObjects.Container;
	private exitBounds?: Phaser.Geom.Rectangle;
	private greenRedLight?: GreenRedLightController;
	private timer?: CountdownTimerController;
	private fog?: FogController;
	private isPaused = false;
	private pauseOverlay?: Phaser.GameObjects.Container;

	constructor() {
		super('level3');
	}

	preload() {
		// Tải các tài nguyên tĩnh ở đây (hình ảnh, âm thanh)
	}

	create() {
		this.isFailed = false;
		this.isWon = false;
		this.failOverlay?.destroy();
		this.failOverlay = undefined;
		this.winOverlay?.destroy();
		this.winOverlay = undefined;
		this.greenRedLight?.destroy();
		this.greenRedLight = undefined;
		this.timer?.destroy();
		this.timer = undefined;
		this.fog?.destroy();
		this.fog = undefined;
		this.pauseOverlay?.destroy();
		this.pauseOverlay = undefined;
		this.isPaused = false;

		this.mazeCols = 31;
		this.mazeRows = 23;
		this.maze = generateMaze(this.mazeCols, this.mazeRows);
		this.cellSize = Math.floor(Math.min(this.scale.width / this.mazeCols, (this.scale.height - HUD_GAP_HEIGHT) / this.mazeRows));
		const mazeWidth = this.mazeCols * this.cellSize;
		const mazeHeight = this.mazeRows * this.cellSize;
		this.offsetX = Math.floor((this.scale.width - mazeWidth) / 2);
		this.offsetY = HUD_GAP_HEIGHT + Math.floor((this.scale.height - HUD_GAP_HEIGHT - mazeHeight) / 2);

		this.cameras.main.setBackgroundColor('#100721');

		const graphics = this.add.graphics();
		graphics.fillStyle(0x100721, 1);
		graphics.fillRect(0, 0, this.scale.width, this.scale.height);

		graphics.fillStyle(0x0d0519, 1);
		graphics.fillRect(0, 0, this.scale.width, HUD_GAP_HEIGHT);

		for (let row = 0; row < this.maze.length; row++) {
			for (let col = 0; col < this.maze[row].length; col++) {
				const isWall = this.maze[row][col] === 1;
				graphics.fillStyle(isWall ? 0x1a0d2e : 0xd7dde8, 1);
				graphics.fillRect(
					this.offsetX + col * this.cellSize,
					this.offsetY + row * this.cellSize,
					this.cellSize,
					this.cellSize
				);
			}
		}

		graphics.fillStyle(0x22c55e, 1);
		graphics.fillRect(this.offsetX, this.offsetY + this.cellSize, this.cellSize, this.cellSize);

		graphics.fillStyle(0xef4444, 1);
		graphics.fillRect(
			this.offsetX + (this.mazeCols - 1) * this.cellSize,
			this.offsetY + (this.mazeRows - 2) * this.cellSize,
			this.cellSize,
			this.cellSize
		);
		this.exitBounds = new Phaser.Geom.Rectangle(
			this.offsetX + (this.mazeCols - 1) * this.cellSize,
			this.offsetY + (this.mazeRows - 2) * this.cellSize,
			this.cellSize,
			this.cellSize
		);

		this.player = new PlayerController(this, {
			x: this.offsetX + this.cellSize / 2,
			y: this.offsetY + this.cellSize * 1.5,
			size: Math.max(8, Math.floor(this.cellSize * 0.6)),
			inertiaCoefficient: LEVEL3_PLAYER_MOVEMENT.inertiaCoefficient,
			acceleration: LEVEL3_PLAYER_MOVEMENT.acceleration * this.cellSize,
			maxSpeed: LEVEL3_PLAYER_MOVEMENT.maxSpeed * this.cellSize
		}, {
			maze: this.maze,
			cellSize: this.cellSize,
			offsetX: this.offsetX,
			offsetY: this.offsetY,
			failThreshold: 0.6
		}, {
			onFail: () => this.showFailMenu()
		});

		this.greenRedLight = new GreenRedLightController(this, {
			x: this.scale.width - 36,
			y: 42,
			ambientX: this.offsetX,
			ambientY: this.offsetY,
			ambientWidth: this.mazeCols * this.cellSize,
			ambientHeight: this.mazeRows * this.cellSize,
			onLose: () => this.showFailMenu()
		});

		this.timer = new CountdownTimerController(this, {
			x: 20,
			y: 20,
			durationMs: 120000,
			onTimeout: () => this.showFailMenu()
		});

		this.fog = new FogController(this, {
			x: this.offsetX,
			y: this.offsetY,
			width: this.mazeCols * this.cellSize,
			height: this.mazeRows * this.cellSize,
			strongness: 0.82
		});

		this.add.text(this.scale.width / 2, 24, 'Level 3', {
			fontSize: '26px',
			fontFamily: 'Cormorant Garamond, serif',
			color: '#C6B9DC'
		}).setOrigin(0.5, 0);

		this.input.keyboard?.on('keydown-ESC', () => this.togglePause());

		// Show intro overlay before the game starts
		this.isIntro = true;
		showIntroOverlay(this, {
			title: 'Màn 3 — Nghách',
			description: 'Giúp Tấm đi đúng đường trong sương mù',
			showSpaceKey: false,
			onStart: () => {
				this.isIntro = false;
			},
		});
	}

	update(_time: number, delta: number) {
		if (this.isFailed || this.isWon || this.isPaused || this.isIntro) {
			return;
		}

		this.player?.update(delta);
		this.greenRedLight?.update(delta, this.player?.getSpeed() ?? 0);
		this.timer?.update(delta);
		if (this.greenRedLight) {
			this.fog?.update(
				delta,
				this.greenRedLight?.getState() ?? 'green',
				this.player?.body.x ?? this.greenRedLight.indicator.x,
				this.player?.body.y ?? this.greenRedLight.indicator.y,
				this.greenRedLight.indicator.x,
				this.greenRedLight.indicator.y
			);
		}

		if (this.player && this.isPlayerAtExit(this.player.body)) {
			this.showWinMenu();
		}
	}

	private showFailMenu(): void {
		if (this.isFailed) {
			return;
		}

		this.isFailed = true;
		this.fog?.destroy();
		this.fog = undefined;
		this.failOverlay = showFailMenu(this, {
			onRestart: () => this.scene.restart(),
			onQuit: () => this.scene.start('selection')
		});

		setCheckpoint("challenge2LoseR3");
	}

	private togglePause(): void {
		if (this.isFailed || this.isWon) {
			return;
		}

		if (this.isPaused) {
			this.isPaused = false;
			this.pauseOverlay?.destroy();
			this.pauseOverlay = undefined;
		} else {
			this.isPaused = true;
			this.pauseOverlay = showPauseMenu(this, {
				onResume: () => this.togglePause(),
				onQuit: () => this.scene.start('selection')
			});
		}
	}

	private showWinMenu(): void {
		if (this.isWon || this.isFailed) {
			return;
		}

		this.isWon = true;
		unlockLevel(3);
		this.fog?.destroy();
		this.fog = undefined;
		this.winOverlay = showWinMenu(this, {
			onContinue: () => {
				switchPath("to_be_continued", 0);
				saveUserdata();
				this.scene.start('selection');
			}
		});

		setCheckpoint("challenge2WinR3");
		saveUserdata();
	}

	private isPlayerAtExit(playerBody: Phaser.GameObjects.Rectangle): boolean {
		if (!this.exitBounds) {
			return false;
		}

		return Phaser.Geom.Intersects.RectangleToRectangle(playerBody.getBounds(), this.exitBounds);
	}
}

import * as Phaser from 'phaser';

export type PlayerConfig = {
	x: number;
	y: number;
	size?: number;
	color?: number;
	acceleration?: number;
	maxSpeed?: number;
	inertiaCoefficient?: number;
};

export type MazeCollisionConfig = {
	maze: number[][];
	cellSize: number;
	offsetX: number;
	offsetY: number;
	failThreshold?: number;
	stopAtWalls?: boolean;
	fallOnCollision?: boolean;
};

export type PlayerEvents = {
	onFail?: () => void;
	onJumpStart?: () => void;
	onJumpEnd?: () => void;
};

export class PlayerController {
	public readonly body: Phaser.GameObjects.Rectangle;

	private readonly scene: Phaser.Scene;
	private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	private readonly wasd: {
		W: Phaser.Input.Keyboard.Key;
		A: Phaser.Input.Keyboard.Key;
		S: Phaser.Input.Keyboard.Key;
		D: Phaser.Input.Keyboard.Key;
	};
	private readonly velocity = new Phaser.Math.Vector2(0, 0);
	private readonly acceleration: number;
	private readonly maxSpeed: number;
	private readonly inertiaCoefficient: number;
	private readonly maze: number[][];
	private readonly cellSize: number;
	private readonly offsetX: number;
	private readonly offsetY: number;
	private readonly failThreshold: number;
	private readonly stopAtWalls: boolean;
	private readonly fallOnCollision: boolean;
	private readonly onFail?: () => void;
	private readonly onJumpStart?: () => void;
	private readonly onJumpEnd?: () => void;
	private isFalling = false;
	private isFailed = false;

	// Jump state
	private _isJumping = false;
	private jumpCooldown = 0;
	private readonly jumpDuration = 400; // ms
	private readonly jumpCooldownTime = 600; // ms
	private jumpGraceTimer = 0; // ms of grace after landing before black holes kill you
	private readonly jumpGraceDuration = 150; // ms
	private jumpProgress = 0; // 0→1→0 over the jump arc
	private jumpShadow?: Phaser.GameObjects.Ellipse;
	private jumpVisual?: Phaser.GameObjects.Container;
	private spaceKey?: Phaser.Input.Keyboard.Key;
	private domSpaceHandler: (() => void) | null = null;
	private lastDirection = new Phaser.Math.Vector2(1, 0);

	// Visual layers
	private visualContainer!: Phaser.GameObjects.Container;

	constructor(scene: Phaser.Scene, config: PlayerConfig, collision?: MazeCollisionConfig, events?: PlayerEvents) {
		this.scene = scene;
		this.acceleration = config.acceleration ?? 900;
		this.maxSpeed = config.maxSpeed ?? 260;
		this.inertiaCoefficient = Phaser.Math.Clamp(config.inertiaCoefficient ?? 0.9, 0, 1);
		this.maze = collision?.maze ?? [];
		this.cellSize = collision?.cellSize ?? 0;
		this.offsetX = collision?.offsetX ?? 0;
		this.offsetY = collision?.offsetY ?? 0;
		this.failThreshold = collision?.failThreshold ?? 0.6;
		this.stopAtWalls = collision?.stopAtWalls ?? false;
		this.fallOnCollision = collision?.fallOnCollision ?? true;
		this.onFail = events?.onFail;
		this.onJumpStart = events?.onJumpStart;
		this.onJumpEnd = events?.onJumpEnd;

		const size = config.size ?? 14;
		this.body = scene.add.rectangle(
			config.x,
			config.y,
			size,
			size,
			0x000000, 0 // invisible body for collision only
		);

		// ── Layered spirit/wisp visual ────────────────────────────────
		const r = size * 0.55;
		this.visualContainer = scene.add.container(config.x, config.y);

		// Outer glow aura
		const aura = scene.add.graphics();
		aura.fillStyle(0x60a5fa, 0.15);
		aura.fillCircle(0, 0, r * 2.0);
		this.visualContainer.add(aura);

		// Body glow
		const glow = scene.add.graphics();
		glow.fillStyle(0x93c5fd, 0.35);
		glow.fillCircle(0, 0, r * 1.35);
		this.visualContainer.add(glow);

		// Main body circle
		const main = scene.add.graphics();
		main.fillStyle(0x60a5fa, 1);
		main.fillCircle(0, 0, r);
		main.lineStyle(1.5, 0xbfdbfe, 0.7);
		main.strokeCircle(0, 0, r);
		this.visualContainer.add(main);

		// Left eye
		const eyeOff = r * 0.32;
		const eyeR = r * 0.18;
		const leftEye = scene.add.graphics();
		leftEye.fillStyle(0xffffff, 0.95);
		leftEye.fillCircle(-eyeOff, -r * 0.15, eyeR);
		leftEye.fillStyle(0x1e3a5f, 1);
		leftEye.fillCircle(-eyeOff + 1, -r * 0.15, eyeR * 0.55);
		this.visualContainer.add(leftEye);

		// Right eye
		const rightEye = scene.add.graphics();
		rightEye.fillStyle(0xffffff, 0.95);
		rightEye.fillCircle(eyeOff, -r * 0.15, eyeR);
		rightEye.fillStyle(0x1e3a5f, 1);
		rightEye.fillCircle(eyeOff + 1, -r * 0.15, eyeR * 0.55);
		this.visualContainer.add(rightEye);

		// Highlight spark
		const spark = scene.add.graphics();
		spark.fillStyle(0xdbeafe, 0.8);
		spark.fillCircle(-r * 0.28, -r * 0.45, r * 0.13);
		this.visualContainer.add(spark);

		// Breathing aura animation
		scene.tweens.add({
			targets: aura,
			scaleX: { from: 0.9, to: 1.1 },
			scaleY: { from: 0.9, to: 1.1 },
			alpha: { from: 0.6, to: 1 },
			duration: 1200,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.InOut',
		});

		const cursors = scene.input.keyboard?.createCursorKeys();
		if (!cursors) {
			throw new Error('Keyboard input is unavailable.');
		}
		this.cursors = cursors;

		this.wasd = scene.input.keyboard!.addKeys('W,A,S,D') as any;

		this.spaceKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		// DOM fallback for Space — browser often eats it before Phaser sees it
		const domHandler = (e: KeyboardEvent) => {
			// Ignore if typing in an input or if VN window is active
			const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement ||
				document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;

			const vnWindow = document.querySelector('.visualnovel-window') as HTMLElement | null;
			const isVNActive = vnWindow && vnWindow.offsetParent !== null;

			if (isInput || isVNActive) {
				return;
			}

			if (e.code === 'Space' && !this._isJumping && this.jumpCooldown <= 0 && !this.isFalling && !this.isFailed) {
				e.preventDefault();
				this.startJump();
			}
		};
		window.addEventListener('keydown', domHandler);
		this.domSpaceHandler = () => window.removeEventListener('keydown', domHandler);

		scene.events.once('shutdown', () => this.destroy());
	}

	update(delta: number): void {
		if (this.isFalling || this.isFailed) {
			return;
		}

		// Handle jump cooldown
		if (this.jumpCooldown > 0) {
			this.jumpCooldown = Math.max(0, this.jumpCooldown - delta);
		}

		// Handle jump grace timer (brief invulnerability after landing)
		if (this.jumpGraceTimer > 0) {
			this.jumpGraceTimer = Math.max(0, this.jumpGraceTimer - delta);
		}

		// Trigger jump on Space press
		if (this.spaceKey?.isDown && !this._isJumping && this.jumpCooldown <= 0) {
			this.startJump();
		}

		const dt = delta / 1000;
		const input = new Phaser.Math.Vector2(
			(this.cursors.right?.isDown || this.wasd.D.isDown ? 1 : 0) - (this.cursors.left?.isDown || this.wasd.A.isDown ? 1 : 0),
			(this.cursors.down?.isDown || this.wasd.S.isDown ? 1 : 0) - (this.cursors.up?.isDown || this.wasd.W.isDown ? 1 : 0)
		);

		if (input.lengthSq() > 0) {
			this.lastDirection.set(input.x, input.y).normalize();
			input.normalize().scale(this.acceleration * dt);
			this.velocity.add(input);
		}

		const damping = Math.pow(this.inertiaCoefficient, delta / (1000 / 60));
		this.velocity.scale(damping);

		if (!this._isJumping && this.velocity.length() > this.maxSpeed) {
			this.velocity.setLength(this.maxSpeed);
		}

		const nextX = this.body.x + this.velocity.x * dt;
		const nextY = this.body.y + this.velocity.y * dt;

		if (this.stopAtWalls) {
			const originalX = this.body.x;
			const originalY = this.body.y;

			this.body.setX(nextX);
			if (this.isTouchingWall()) {
				this.body.setX(originalX);
				this.velocity.x = 0;
			}

			this.body.setY(nextY);
			if (this.isTouchingWall()) {
				this.body.setY(originalY);
				this.velocity.y = 0;
			}
		} else {
			this.body.setPosition(nextX, nextY);
		}

		// Sync visual container with body position
		this.visualContainer.setPosition(this.body.x, this.body.y);
		this.visualContainer.setAlpha(this.body.alpha);

		// Frame-by-frame jump visual: arc follows the body in real-time
		if (this._isJumping) {
			this.visualContainer.setAlpha(0);
			const bodySize = this.body.width;
			const jumpHeight = bodySize * 2.2;

			// jumpProgress goes 0→1 (up) then 1→0 (down)
			const arcPhase = this.jumpProgress <= 0.5
				? this.jumpProgress / 0.5          // 0→1 going up
				: 1 - (this.jumpProgress - 0.5) / 0.5; // 1→0 coming down
			const arcY = this.body.y - jumpHeight * arcPhase;

			if (this.jumpVisual) {
				this.jumpVisual.setPosition(this.body.x, arcY);
				// Scale up at apex
				const scale = 1 + 0.15 * arcPhase;
				this.jumpVisual.setScale(scale);
			}
			if (this.jumpShadow) {
				this.jumpShadow.setPosition(this.body.x, this.body.y + 4);
			}

			// Advance progress
			const step = delta / this.jumpDuration;
			this.jumpProgress += step;
			if (this.jumpProgress >= 1) {
				this._isJumping = false;
				this.jumpProgress = 0;
				this.jumpGraceTimer = this.jumpGraceDuration;
				this.visualContainer.setAlpha(1);
				this.jumpVisual?.destroy();
				this.jumpVisual = undefined;
				this.jumpShadow?.destroy();
				this.jumpShadow = undefined;
				this.onJumpEnd?.();
			}
		}

		// Only check hole collisions when NOT jumping and NOT in grace period
		if (!this._isJumping && this.jumpGraceTimer <= 0 && this.fallOnCollision && this.isPlayerFallenIntoHole()) {
			this.startFallSequence();
		}
	}

	public getSpeed(): number {
		return this.velocity.length();
	}

	public get isJumping(): boolean {
		return this._isJumping;
	}

	/**
	 * Check if player center is on a black hole cell (maze value === 2)
	 */
	public isOnBlackHole(): boolean {
		if (!this.maze.length || this.cellSize <= 0) {
			return false;
		}

		const col = Math.floor((this.body.x - this.offsetX) / this.cellSize);
		const row = Math.floor((this.body.y - this.offsetY) / this.cellSize);

		if (row < 0 || row >= this.maze.length || col < 0 || col >= (this.maze[0]?.length ?? 0)) {
			return false;
		}

		return this.maze[row][col] === 2;
	}

	private startJump(): void {
		this._isJumping = true;
		this.jumpProgress = 0;
		this.jumpCooldown = this.jumpCooldownTime;
		this.jumpGraceTimer = 0;

		// Strong impulse in movement direction — enough to clear ~1.5 cells
		const crossImpulse = this.cellSize * 5.0;
		this.velocity.x += this.lastDirection.x * crossImpulse;
		this.velocity.y += this.lastDirection.y * crossImpulse;

		this.onJumpStart?.();

		const bodySize = this.body.width;

		// Tạo shadow tại vị trí gốc (trên mặt đất)
		this.jumpShadow = this.scene.add.ellipse(
			this.body.x, this.body.y + 4,
			bodySize * 0.9, bodySize * 0.45,
			0x000000, 0.4
		);
		this.jumpShadow.setDepth(this.body.depth - 1);

		// Tạo jump visual container (giống hình dạng player)
		const r = bodySize * 0.55;
		this.jumpVisual = this.scene.add.container(this.body.x, this.body.y);
		const jGlow = this.scene.add.graphics();
		jGlow.fillStyle(0x93c5fd, 0.35);
		jGlow.fillCircle(0, 0, r * 1.35);
		this.jumpVisual.add(jGlow);
		const jMain = this.scene.add.graphics();
		jMain.fillStyle(0x60a5fa, 1);
		jMain.fillCircle(0, 0, r);
		jMain.lineStyle(1.5, 0xbfdbfe, 0.7);
		jMain.strokeCircle(0, 0, r);
		this.jumpVisual.add(jMain);
		const jEyeOff = r * 0.32;
		const jEyeR = r * 0.18;
		const jLE = this.scene.add.graphics();
		jLE.fillStyle(0xffffff, 0.95);
		jLE.fillCircle(-jEyeOff, -r * 0.15, jEyeR);
		jLE.fillStyle(0x1e3a5f, 1);
		jLE.fillCircle(-jEyeOff + 1, -r * 0.15, jEyeR * 0.55);
		this.jumpVisual.add(jLE);
		const jRE = this.scene.add.graphics();
		jRE.fillStyle(0xffffff, 0.95);
		jRE.fillCircle(jEyeOff, -r * 0.15, jEyeR);
		jRE.fillStyle(0x1e3a5f, 1);
		jRE.fillCircle(jEyeOff + 1, -r * 0.15, jEyeR * 0.55);
		this.jumpVisual.add(jRE);
		this.jumpVisual.setDepth(this.body.depth + 10);
	}

	private startFallSequence(): void {
		if (this.isFalling || this.isFailed) {
			return;
		}

		this.isFalling = true;

		this.scene.tweens.add({
			targets: this.visualContainer,
			angle: 720,
			scaleX: 0.08,
			scaleY: 0.08,
			alpha: 0.25,
			duration: 520,
			ease: 'Cubic.In',
			onComplete: () => {
				this.isFalling = false;
				this.isFailed = true;
				this.onFail?.();
			}
		});
	}

	private isPlayerFallenIntoHole(): boolean {
		if (!this.maze.length || this.cellSize <= 0) {
			return false;
		}

		const bounds = this.body.getBounds();
		const playerArea = bounds.width * bounds.height;
		let overlapHoleArea = 0;

		const mazeRows = this.maze.length;
		const mazeCols = this.maze[0]?.length ?? 0;
		const minCol = Math.floor((bounds.left - this.offsetX) / this.cellSize);
		const maxCol = Math.floor((bounds.right - this.offsetX) / this.cellSize);
		const minRow = Math.floor((bounds.top - this.offsetY) / this.cellSize);
		const maxRow = Math.floor((bounds.bottom - this.offsetY) / this.cellSize);

		for (let row = minRow; row <= maxRow; row++) {
			for (let col = minCol; col <= maxCol; col++) {
				const isOutsideMaze = row < 0 || row >= mazeRows || col < 0 || col >= mazeCols;
				const isHoleTile = isOutsideMaze || this.maze[row][col] === 1;

				if (!isHoleTile) {
					continue;
				}

				const cellLeft = this.offsetX + col * this.cellSize;
				const cellRight = cellLeft + this.cellSize;
				const cellTop = this.offsetY + row * this.cellSize;
				const cellBottom = cellTop + this.cellSize;

				const overlapX = Math.max(0, Math.min(bounds.right, cellRight) - Math.max(bounds.left, cellLeft));
				const overlapY = Math.max(0, Math.min(bounds.bottom, cellBottom) - Math.max(bounds.top, cellTop));
				overlapHoleArea += overlapX * overlapY;
			}
		}

		return overlapHoleArea >= playerArea * this.failThreshold;
	}

	private isTouchingWall(): boolean {
		if (!this.maze.length || this.cellSize <= 0) {
			return false;
		}

		const bounds = this.body.getBounds();
		const minCol = Math.floor((bounds.left - this.offsetX) / this.cellSize);
		const maxCol = Math.floor((bounds.right - this.offsetX) / this.cellSize);
		const minRow = Math.floor((bounds.top - this.offsetY) / this.cellSize);
		const maxRow = Math.floor((bounds.bottom - this.offsetY) / this.cellSize);

		for (let row = minRow; row <= maxRow; row++) {
			for (let col = minCol; col <= maxCol; col++) {
				const isOutsideMaze = row < 0 || row >= this.maze.length || col < 0 || col >= (this.maze[0]?.length ?? 0);
				if (isOutsideMaze || this.maze[row][col] === 1) {
					return true;
				}
			}
		}

		return false;
	}

	/** Clean up DOM listeners */
	public destroy(): void {
		this.domSpaceHandler?.();
		this.domSpaceHandler = null;
	}
}

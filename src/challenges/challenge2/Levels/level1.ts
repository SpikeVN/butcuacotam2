import * as Phaser from 'phaser';
import { generateMaze } from '../maze_gen';
import { PlayerController } from '../logic/player';
import { ChaserController } from '../logic/chaser';
import { GreenRedLightController } from '../logic/green_red_light';
import { CountdownTimerController } from '../logic/timer';
import { unlockLevel } from '../logic/progress';
import { showFailMenu } from '../Menu/fail_menu';
import { showWinMenu } from '../Menu/win_menu';
import { showPauseMenu } from '../Menu/pause_menu';
import { BlackHoleRenderer } from '../logic/black_hole';
import { saveUserdata, setCheckpoint } from '../../../engine/userdata';
import { switchPath } from '../../../engine/script';

const LEVEL1_PLAYER_MOVEMENT = {
    acceleration: 75,
    maxSpeed: 105,
    inertiaCoefficient: 0.83
};

const HUD_GAP_HEIGHT = 84;

export default class Level1 extends Phaser.Scene {
    private player?: PlayerController;
    private maze: number[][] = [];
    private cellSize = 0;
    private mazeCols = 0;
    private mazeRows = 0;
    private offsetX = 0;
    private offsetY = 0;
    private isFailed = false;
    private isWon = false;
    private failOverlay?: Phaser.GameObjects.Container;
    private winOverlay?: Phaser.GameObjects.Container;
    private exitBounds?: Phaser.Geom.Rectangle;
    private greenRedLight?: GreenRedLightController;
    private timer?: CountdownTimerController;
    private chaser?: ChaserController;
    private chaserCollisionGraceMs = 3000;
    private elapsedSinceStart = 0;
    private isPaused = false;
    private pauseOverlay?: Phaser.GameObjects.Container;
    private blackHoleRenderers: BlackHoleRenderer[] = [];

    constructor() {
        super('level1');
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
        this.chaser?.destroy();
        this.chaser = undefined;
        this.pauseOverlay?.destroy();
        this.pauseOverlay = undefined;
        this.isPaused = false;
        this.elapsedSinceStart = 0;

        this.mazeCols = 25;
        this.mazeRows = 17;
        this.maze = generateMaze(this.mazeCols, this.mazeRows);
        this.placeBlackHoles(5);
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
                const cellVal = this.maze[row][col];
                const isWall = cellVal === 1;
                graphics.fillStyle(isWall ? 0x1a0d2e : 0xd7dde8, 1);
                graphics.fillRect(
                    this.offsetX + col * this.cellSize,
                    this.offsetY + row * this.cellSize,
                    this.cellSize,
                    this.cellSize
                );
            }
        }

        this.renderBlackHoles();

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
            inertiaCoefficient: LEVEL1_PLAYER_MOVEMENT.inertiaCoefficient,
            acceleration: LEVEL1_PLAYER_MOVEMENT.acceleration * this.cellSize,
            maxSpeed: LEVEL1_PLAYER_MOVEMENT.maxSpeed * this.cellSize
        }, {
            maze: this.maze,
            cellSize: this.cellSize,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            failThreshold: 0,
            stopAtWalls: true,
            fallOnCollision: false
        }, {
            onFail: () => this.showFailMenu()
        });

        this.chaser = new ChaserController(this, {
            maze: this.maze,
            cellSize: this.cellSize,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            startCol: 0,
            startRow: 1,
            speed: 3.5
        });

        this.time.delayedCall(500, () => this.chaser?.activate());

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
            durationMs: 120000,
            x: 20,
            y: 20,
            onTimeout: () => this.showFailMenu()
        });

        this.add.text(this.scale.width / 2, 24, 'Level 1', {
            fontSize: '26px',
            fontFamily: 'Cormorant Garamond, serif',
            color: '#C6B9DC'
        }).setOrigin(0.5, 0);

        this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    }

    update(_time: number, delta: number) {
        if (this.isFailed || this.isWon || this.isPaused) {
            return;
        }

        this.player?.update(delta);
        this.chaser?.update(delta, this.player?.body.x ?? 0, this.player?.body.y ?? 0);

        this.elapsedSinceStart += delta;
        const playerBody = this.player?.body;
        const chaserBody = this.chaser?.body;
        const lightState = this.greenRedLight?.getState();
        this.chaser?.setFrozen(lightState === 'red');

        if (this.elapsedSinceStart >= this.chaserCollisionGraceMs && playerBody && chaserBody && this.chaser?.isActive && lightState !== 'red') {
            if (Phaser.Geom.Intersects.RectangleToRectangle(playerBody.getBounds(), chaserBody.getBounds())) {
                this.showFailMenu();
                return;
            }
        }

        this.greenRedLight?.update(delta, this.player?.getSpeed() ?? 0);
        this.timer?.update(delta);

        // Black hole check: if player is on black hole and not jumping → fail
        if (this.player && !this.player.isJumping && this.player.isOnBlackHole()) {
            this.showFailMenu();
            return;
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
        this.chaser?.destroy();
        this.failOverlay = showFailMenu(this, {
            onRestart: () => this.scene.restart(),
            onQuit: () => this.scene.start('selection')
        });

        setCheckpoint("challenge2LoseR1");

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
        this.chaser?.destroy();
        unlockLevel(2);
        this.winOverlay = showWinMenu(this, {
            onContinue: () => this.scene.start('selection')
        });

        setCheckpoint("challenge2WinR1");
        switchPath("game2_saves", 0);
        saveUserdata();
    }

    private isPlayerAtExit(playerBody: Phaser.GameObjects.Rectangle): boolean {
        if (!this.exitBounds) {
            return false;
        }

        return Phaser.Geom.Intersects.RectangleToRectangle(playerBody.getBounds(), this.exitBounds);
    }

    private placeBlackHoles(count: number): void {
        const safeCells = new Set<string>();
        // Protect start area and exit area (3 cell radius)
        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
                safeCells.add(`${0 + dc},${1 + dr}`);
                safeCells.add(`${this.mazeCols - 1 + dc},${this.mazeRows - 2 + dr}`);
            }
        }

        const candidates: { col: number; row: number }[] = [];
        for (let row = 0; row < this.mazeRows; row++) {
            for (let col = 0; col < this.mazeCols; col++) {
                if (this.maze[row][col] !== 0 || safeCells.has(`${col},${row}`)) continue;

                // Only allow straight corridors (horizontal or vertical)
                const up = row > 0 && this.maze[row - 1][col] !== 1;
                const down = row < this.mazeRows - 1 && this.maze[row + 1][col] !== 1;
                const left = col > 0 && this.maze[row][col - 1] !== 1;
                const right = col < this.mazeCols - 1 && this.maze[row][col + 1] !== 1;
                const isStraight = (left && right && !up && !down) || (up && down && !left && !right);

                if (isStraight) {
                    candidates.push({ col, row });
                }
            }
        }

        // Shuffle and pick
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }

        const placed = Math.min(count, candidates.length);
        for (let i = 0; i < placed; i++) {
            const { col, row } = candidates[i];
            this.maze[row][col] = 2;
        }
    }

    private renderBlackHoles(): void {
        this.blackHoleRenderers.forEach(r => r.destroy());
        this.blackHoleRenderers = [];

        for (let row = 0; row < this.maze.length; row++) {
            for (let col = 0; col < this.maze[row].length; col++) {
                if (this.maze[row][col] !== 2) continue;

                const cx = this.offsetX + col * this.cellSize + this.cellSize / 2;
                const cy = this.offsetY + row * this.cellSize + this.cellSize / 2;

                this.blackHoleRenderers.push(new BlackHoleRenderer({
                    scene: this,
                    cx,
                    cy,
                    cellSize: this.cellSize,
                }));
            }
        }
    }
}

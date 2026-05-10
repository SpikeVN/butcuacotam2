import * as Phaser from 'phaser';

import fontBricolage from "../../../../assets/fonts/bricolage-grotesque-v9-latin_vietnamese-regular.woff2";
import fontCormorant from "../../../../assets/fonts/cormorant-garamond-v21-latin_vietnamese-600italic.woff2";
import { getUnlockedLevel } from '../logic/progress';
import { sceneIs, switchPath } from '../../../engine/script';
import { saveUserdata, setCheckpoint } from '../../../engine/userdata';
import { showWinMenu } from './win_menu';
import { showNotification } from '../../../engine/notification';

type LevelCardConfig = {
	index: number;
	sceneKey?: string;
	y: number;
	icon: string;
	title: string;
	desc: string;
	badge: string;
	unlocked: boolean;
	borderColor: number;
	borderAlpha: number;
	badgeColor: string;
	badgeBgColor: number;
	badgeBgAlpha: number;
	badgeBorderColor: number;
	badgeBorderAlpha: number;
};

const BG_COLOR = 0x100721;
const CARD_BG = 0x1a0f2e;
const ACCENT = 0xB4A3FD;
const TEXT = '#C6B9DC';

export default class Selection extends Phaser.Scene {
	constructor() {
		super('selection');
	}

	preload() {
		this.load.font({
			key: "sans",
			url: fontBricolage,
			format: "woff2",
			descriptors: {
				weight: "400"
			}
		});
		this.load.font({
			key: "serif",
			url: fontCormorant,
			format: "woff2",
			descriptors: {
				weight: "600"
			}
		});
	}

	create(): void {
		this.cameras.main.setBackgroundColor('#100721');

		const { width, height } = this.scale;
		const centerX = width / 2;

		this.add.rectangle(0, 0, width, height, BG_COLOR, 1).setOrigin(0, 0);
		this.drawCornerBrackets(width, height);

		this.add.text(centerX, height * 0.18, 'CHỌN MÀN CHƠI', {
			fontSize: '14px',
			fontFamily: "sans",
			color: "#B4A3FD",
			letterSpacing: 6
		}).setOrigin(0.5);

		const firstCardY = height * 0.35;
		const cardSpacing = 104;
		const unlockedLevel = getUnlockedLevel();

		this.createLevelCard({
			index: 1,
			sceneKey: 'level1',
			y: firstCardY,
			icon: '🚀',
			title: 'Màn 1 - Đường',
			desc: 'Đường nào mà lại có hố đen?',
			badge: (unlockedLevel >= 2 || sceneIs(2, "r1_complete", "r2_complete", "r3_complete")) ? 'Xong' : 'Dễ',
			unlocked: true,
			borderColor: ACCENT,
			borderAlpha: 0.35,
			badgeColor: '#B4A3FD',
			badgeBgColor: ACCENT,
			badgeBgAlpha: 0.094,
			badgeBorderColor: ACCENT,
			badgeBorderAlpha: 0.2
		});

		this.createLevelCard({
			index: 2,
			sceneKey: 'level2',
			y: firstCardY + cardSpacing,
			icon: '🕳️',
			title: 'Màn 2 - Ngõ',
			desc: 'Vực thẳm...?',
			badge: (unlockedLevel >= 3 || sceneIs(2, "r2_complete", "r3_complete")) ? 'Xong' : 'Vừa',
			unlocked: unlockedLevel >= 2,
			borderColor: ACCENT,
			borderAlpha: 0.2,
			badgeColor: '#B4A3FDaa',
			badgeBgColor: ACCENT,
			badgeBgAlpha: 0.063,
			badgeBorderColor: ACCENT,
			badgeBorderAlpha: 0.094
		});

		this.createLevelCard({
			index: 3,
			sceneKey: 'level3',
			y: firstCardY + cardSpacing * 2,
			icon: unlockedLevel >= 3 ? '🌀' : '🔒',
			title: 'Màn 3 — Nghách',
			desc: 'Bí ẩn',
			badge: sceneIs(2, "r3_complete") ? 'Xong' : (unlockedLevel >= 3 ? 'Khó' : 'Khóa'),
			unlocked: unlockedLevel >= 3,
			borderColor: 0xC6B9DC,
			borderAlpha: unlockedLevel >= 3 ? 0.2 : 0.1,
			badgeColor: unlockedLevel >= 3 ? '#B4A3FDaa' : '#C6B9DC44',
			badgeBgColor: ACCENT,
			badgeBgAlpha: unlockedLevel >= 3 ? 0.063 : 0,
			badgeBorderColor: 0xC6B9DC,
			badgeBorderAlpha: 0.094,
		});

		this.add.text(centerX, height * 0.93, 'Nhấn phím 1 / 2 / 3 hoặc click để chọn', {
			fontSize: '16px',
			fontFamily: "sans",
			color: TEXT,
			letterSpacing: 1.5
		}).setOrigin(0.5).setAlpha(0.2);

		// Standalone skip button (only visible when level 3 is unlocked but not completed)
		if (unlockedLevel >= 3 && sceneIs(2, "r2_complete")) {
			const skipBtnY = firstCardY + cardSpacing * 2 + 72;
			const skipBtn = this.add.text(centerX, skipBtnY, '⏭ Bỏ qua màn 3', {
				fontSize: '14px',
				fontFamily: "sans",
				color: '#B4A3FD',
				backgroundColor: '#1a0f2e',
				padding: { x: 16, y: 8 }
			}).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

			const skipBorder = this.add.graphics().setDepth(10);
			skipBorder.lineStyle(1, 0xB4A3FD, 0.4);
			skipBorder.strokeRect(skipBtn.x - skipBtn.width / 2 - 2, skipBtn.y - skipBtn.height / 2 - 2, skipBtn.width + 4, skipBtn.height + 4);

			skipBtn.on('pointerdown', () => {
				showWinMenu(this, {
					onContinue: () => {
						this.scene.restart();
					}
				});
			});

			skipBtn.on('pointerover', () => skipBtn.setAlpha(0.7));
			skipBtn.on('pointerout', () => skipBtn.setAlpha(1));
		}

		this.input.keyboard?.on('keydown-ONE', () => this.scene.start('level1'));
		if (unlockedLevel >= 2) this.input.keyboard?.on('keydown-TWO', () => this.scene.start('level2'));
		if (unlockedLevel >= 3) this.input.keyboard?.on('keydown-THREE', () => this.scene.start('level3'));

		// Konami Code Implementation
		const konamiCode = ['UP', 'UP', 'DOWN', 'DOWN', 'LEFT', 'RIGHT', 'LEFT', 'RIGHT', 'B', 'A'];
		let konamiIndex = 0;

		this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
			const key = event.key.toUpperCase();
			const expectedKey = konamiCode[konamiIndex];

			// Map Phaser key names to KeyboardEvent.key if necessary, but UP/DOWN/LEFT/RIGHT usually work or can be checked via event.key
			const keyMap: Record<string, string> = {
				'ARROWUP': 'UP',
				'ARROWDOWN': 'DOWN',
				'ARROWLEFT': 'LEFT',
				'ARROWRIGHT': 'RIGHT',
			};

			const pressedKey = keyMap[key] || key;

			if (pressedKey === expectedKey) {
				konamiIndex++;
				if (konamiIndex === konamiCode.length) {
					// Cheat activated!
					konamiIndex = 0;
					setCheckpoint("challenge2WinR2");
					setCheckpoint("challenge2CheatCodeActivated");
					switchPath("game2_saves", 1);
					showNotification("Thành tựu", "Bạn vừa hack game thành công. Chúc mừng!")
					saveUserdata();

					// Visual feedback and refresh
					this.cameras.main.flash(500, 180, 163, 253); // Flash with ACCENT color
					this.scene.restart();
				}
			} else {
				konamiIndex = 0;
			}
		});
	}

	private drawCornerBrackets(width: number, height: number): void {
		const graphics = this.add.graphics();
		graphics.lineStyle(1.5, ACCENT, 0.2);

		this.drawBracket(graphics, 28, 28, 1, 1);
		this.drawBracket(graphics, width - 28, 28, -1, 1);
		this.drawBracket(graphics, 28, height - 28, 1, -1);
		this.drawBracket(graphics, width - 28, height - 28, -1, -1);
	}

	private drawBracket(graphics: Phaser.GameObjects.Graphics, x: number, y: number, xDir: number, yDir: number): void {
		graphics.beginPath();
		graphics.moveTo(x, y);
		graphics.lineTo(x + 44 * xDir, y);
		graphics.moveTo(x, y);
		graphics.lineTo(x, y + 44 * yDir);
		graphics.strokePath();
	}

	private createLevelCard(config: LevelCardConfig): void {
		const x = this.scale.width / 2;
		const cardWidth = this.scale.width * 0.52;
		const cardHeight = 88;

		const shadow = this.add.graphics();
		shadow.fillStyle(0x422670, 1);
		shadow.fillRect(x - cardWidth / 2, config.y - cardHeight / 2 + 4, cardWidth, cardHeight);
		shadow.setAlpha(config.unlocked ? 1 : 0.4);

		const container = this.add.container(x, config.y);
		container.setAlpha(config.unlocked ? 1 : 0.4);

		const card = this.add.graphics();
		this.drawCard(card, cardWidth, cardHeight, config.borderColor, config.borderAlpha);
		container.add(card);

		const icon = this.add.graphics();
		icon.fillStyle(ACCENT, 0.082);
		icon.fillCircle(-cardWidth / 2 + 56, 0, 26);
		icon.lineStyle(1, ACCENT, 0.2);
		icon.strokeCircle(-cardWidth / 2 + 56, 0, 26);
		container.add(icon);

		container.add(this.add.text(-cardWidth / 2 + 56, 0, config.icon, {
			fontSize: '26px',
			fontFamily: "sans"
		}).setOrigin(0.5));

		container.add(this.add.text(-cardWidth / 2 + 96, -19, config.title, {
			fontSize: '20px',
			fontFamily: "sans",
			fontStyle: '500',
			color: TEXT
		}).setOrigin(0, 0.5));

		container.add(this.add.text(-cardWidth / 2 + 96, 18, config.desc, {
			fontSize: '16px',
			fontFamily: "sans",
			color: TEXT
		}).setOrigin(0, 0.5).setAlpha(0.4));

		this.addBadge(container, config, cardWidth);

		if (!config.unlocked || !config.sceneKey) {
			return;
		}

		const hitArea = this.add.rectangle(0, 0, cardWidth, cardHeight, 0xffffff, 0);
		hitArea.setInteractive({ useHandCursor: true });
		container.add(hitArea);

		hitArea.on('pointerdown', () => this.scene.start(config.sceneKey as string));
		hitArea.on('pointerover', () => {
			this.drawCard(card, cardWidth, cardHeight, config.borderColor, 0.7);
			this.tweens.add({ targets: container, y: config.y + 4, duration: 100, ease: 'Sine.Out' });
			this.tweens.add({ targets: shadow, alpha: 0, duration: 100, ease: 'Sine.Out' });
		});
		hitArea.on('pointerout', () => {
			this.drawCard(card, cardWidth, cardHeight, config.borderColor, config.borderAlpha);
			this.tweens.add({ targets: container, y: config.y, duration: 100, ease: 'Sine.Out' });
			this.tweens.add({ targets: shadow, alpha: config.unlocked ? 1 : 0.4, duration: 100, ease: 'Sine.Out' });
		});
	}

	private drawCard(graphics: Phaser.GameObjects.Graphics, width: number, height: number, borderColor: number, borderAlpha: number): void {
		graphics.clear();
		graphics.fillStyle(CARD_BG, 1);
		graphics.fillRect(-width / 2, -height / 2, width, height);
		graphics.lineStyle(1.5, borderColor, borderAlpha);
		graphics.strokeRect(-width / 2, -height / 2, width, height);
	}

	private addBadge(container: Phaser.GameObjects.Container, config: LevelCardConfig, cardWidth: number): void {
		const badgeWidth = 68;
		const badgeHeight = 28;
		const badgeX = cardWidth / 2 - 60;

		const badge = this.add.graphics();
		badge.fillStyle(config.badgeBgColor, config.badgeBgAlpha);
		badge.fillRect(badgeX - badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight);
		badge.lineStyle(1, config.badgeBorderColor, config.badgeBorderAlpha);
		badge.strokeRect(badgeX - badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight);
		container.add(badge);

		container.add(this.add.text(badgeX, 0, config.badge, {
			fontSize: '14px',
			fontFamily: "sans",
			color: config.badgeColor
		}).setOrigin(0.5));
	}
}

import * as Phaser from 'phaser';
import { switchPath } from '../../../engine/script';
import { saveUserdata } from '../../../engine/userdata';

export type ShowWinMenuOptions = {
	onContinue: () => void;
};

export function showWinMenu(scene: Phaser.Scene, options: ShowWinMenuOptions): Phaser.GameObjects.Container {
	const overlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x100721, 0.7);
	overlay.setOrigin(0, 0);

	const title = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 - 40, 'Thành công', {
		fontSize: '42px',
		fontFamily: 'Cormorant Garamond, serif',
		color: '#B4A3FD'
	});
	title.setOrigin(0.5);

	// Continue button
	const btnWidth = 200;
	const btnHeight = 48;
	const btnX = scene.scale.width / 2;
	const btnY = scene.scale.height / 2 + 30;

	const btnBg = scene.add.graphics();
	btnBg.fillStyle(0x1a0f2e, 1);
	btnBg.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 6);
	btnBg.lineStyle(1.5, 0xB4A3FD, 0.6);
	btnBg.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 6);

	const btnText = scene.add.text(btnX, btnY, 'Tiếp tục', {
		fontSize: '20px',
		fontFamily: 'Bricolage Grotesque, sans-serif',
		color: '#B4A3FD'
	});
	btnText.setOrigin(0.5);

	const hitArea = scene.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0xffffff, 0);
	hitArea.setInteractive({ useHandCursor: true });

	hitArea.on('pointerover', () => {
		btnBg.clear();
		btnBg.fillStyle(0xB4A3FD, 0.15);
		btnBg.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 6);
		btnBg.lineStyle(1.5, 0xB4A3FD, 1);
		btnBg.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 6);
	});

	hitArea.on('pointerout', () => {
		btnBg.clear();
		btnBg.fillStyle(0x1a0f2e, 1);
		btnBg.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 6);
		btnBg.lineStyle(1.5, 0xB4A3FD, 0.6);
		btnBg.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 6);
	});

	hitArea.on('pointerdown', () => {
		scene.events.off('shutdown', cleanup);
		options.onContinue();
		switchPath("to_be_continued", 0);
		saveUserdata()
	});

	const container = scene.add.container(0, 0, [overlay, title, btnBg, btnText, hitArea]);

	const cleanup = () => {
		hitArea.removeInteractive();
	};

	scene.events.once('shutdown', cleanup);

	return container;
}

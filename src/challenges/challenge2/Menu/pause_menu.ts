import * as Phaser from 'phaser';

export type PauseMenuCallbacks = {
	onResume: () => void;
	onQuit: () => void;
};

export function showPauseMenu(scene: Phaser.Scene, callbacks: PauseMenuCallbacks): Phaser.GameObjects.Container {
	const overlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x100721, 0.75);
	overlay.setOrigin(0, 0);

	const title = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 - 60, 'PAUSED', {
		fontSize: '42px',
		fontFamily: 'Cormorant Garamond, serif',
		color: '#C6B9DC'
	});
	title.setOrigin(0.5);

	// Resume button
	const resumeBg = scene.add.rectangle(scene.scale.width / 2, scene.scale.height / 2 + 10, 260, 48, 0x1a0d2e, 0.95);
	resumeBg.setStrokeStyle(2, 0xB4A3FD, 0.9);
	const resumeText = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 + 10, 'Resume  [ESC]', {
		fontSize: '22px',
		fontFamily: 'Bricolage Grotesque, sans-serif',
		color: '#B4A3FD'
	});
	resumeText.setOrigin(0.5);

	resumeBg.setInteractive({ useHandCursor: true });
	resumeBg.on('pointerover', () => resumeBg.setFillStyle(0x2a1647, 0.98));
	resumeBg.on('pointerout', () => resumeBg.setFillStyle(0x1a0d2e, 0.95));
	resumeBg.on('pointerdown', () => callbacks.onResume());
	resumeText.setInteractive({ useHandCursor: true });
	resumeText.on('pointerdown', () => callbacks.onResume());

	// Quit button
	const quitBg = scene.add.rectangle(scene.scale.width / 2, scene.scale.height / 2 + 70, 260, 48, 0x1a0d2e, 0.95);
	quitBg.setStrokeStyle(2, 0xef4444, 0.9);
	const quitText = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 + 70, 'Quit to Menu', {
		fontSize: '22px',
		fontFamily: 'Bricolage Grotesque, sans-serif',
		color: '#f87171'
	});
	quitText.setOrigin(0.5);

	quitBg.setInteractive({ useHandCursor: true });
	quitBg.on('pointerover', () => quitBg.setFillStyle(0x2a1647, 0.98));
	quitBg.on('pointerout', () => quitBg.setFillStyle(0x1a0d2e, 0.95));
	quitBg.on('pointerdown', () => callbacks.onQuit());
	quitText.setInteractive({ useHandCursor: true });
	quitText.on('pointerdown', () => callbacks.onQuit());

	const container = scene.add.container(0, 0, [overlay, title, resumeBg, resumeText, quitBg, quitText]);
	return container;
}

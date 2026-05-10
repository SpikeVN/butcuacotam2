import * as Phaser from 'phaser';

export type ShowFailMenuOptions = {
	onRestart: () => void;
	onQuit: () => void;
};

export function showFailMenu(scene: Phaser.Scene, options: ShowFailMenuOptions): Phaser.GameObjects.Container {
	const overlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x100721, 0.7);
	overlay.setOrigin(0, 0);

	const title = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 - 24, 'Thất bại', {
		fontSize: '42px',
		fontFamily: 'Cormorant Garamond, serif',
		color: '#f87171'
	});
	title.setOrigin(0.5);

	const hint = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 + 24, 'Bấm bất kỳ phím nào để thử lại, Esc để về menu.', {
		fontSize: '24px',
		fontFamily: 'Bricolage Grotesque, sans-serif',
		color: '#C6B9DC'
	});
	hint.setOrigin(0.5);

	const container = scene.add.container(0, 0, [overlay, title, hint]);

	const handleKeyDown = (event: KeyboardEvent) => {
		// Ignore modifier keys
		if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'NumLock'].includes(event.key)) {
			return;
		}

		// Prevent browser defaults (like scrolling on Space)
		if (event.key === ' ' || event.key === 'Escape') {
			event.preventDefault();
		}

		// Remove listeners
		window.removeEventListener('keydown', handleKeyDown);
		scene.events.off('shutdown', cleanup);

		if (event.key === 'Escape' || event.keyCode === 27) {
			options.onQuit();
		} else {
			options.onRestart();
		}
	};

	const cleanup = () => {
		window.removeEventListener('keydown', handleKeyDown);
	};

	// Use a short delay to prevent catching the key that triggered the failure
	scene.time.delayedCall(100, () => {
		window.addEventListener('keydown', handleKeyDown);
		scene.events.once('shutdown', cleanup);
	});

	return container;
}

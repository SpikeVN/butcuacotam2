import * as Phaser from 'phaser';

export type IntroOverlayConfig = {
    title: string;
    description: string;
    showSpaceKey?: boolean;
    onStart: () => void;
};

/**
 * Shows a full-screen intro overlay with level title, description,
 * keyboard controls diagram (WASD / Arrow keys), and a "press any key" prompt.
 * The overlay listens for the first keyboard input, then destroys itself
 * and calls `onStart` to begin the game (start timer, enable player movement).
 */
export function showIntroOverlay(
    scene: Phaser.Scene,
    config: IntroOverlayConfig
): Phaser.GameObjects.Container {
    const { width, height } = scene.scale;
    const container = scene.add.container(0, 0).setDepth(1000);

    // Dimmed background
    const bg = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);
    bg.setInteractive(); // block clicks through
    container.add(bg);

    // ── Card background ──
    const cardW = 500;
    const cardH = 400;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    // ── Card Shadow ──
    const cardShadow = scene.add.graphics();
    cardShadow.fillStyle(0x422670, 1);
    cardShadow.fillRect(cardX, cardY + 4, cardW, cardH);
    container.add(cardShadow);

    const card = scene.add.graphics();
    card.fillStyle(0x1a0f2e, 1);
    card.fillRect(cardX, cardY, cardW, cardH);
    card.lineStyle(1.5, 0xb4a3fd, 0.35);
    card.strokeRect(cardX, cardY, cardW, cardH);
    container.add(card);

    // ── Title ──
    const titleText = scene.add.text(width / 2, cardY + 36, config.title, {
        fontSize: '22px',
        fontFamily: 'Cormorant Garamond, serif',
        color: '#E8DFFF',
        fontStyle: 'italic',
    }).setOrigin(0.5, 0);
    container.add(titleText);

    // ── Description ──
    const descText = scene.add.text(width / 2, cardY + 72, config.description, {
        fontSize: '14px',
        fontFamily: 'Bricolage Grotesque, sans-serif',
        color: '#9CA3AF',
        align: 'center',
        wordWrap: { width: cardW - 60 },
    }).setOrigin(0.5, 0);
    container.add(descText);

    // ── Disclaimer about Vietnamese input methods ──
    const disclaimerText = scene.add.text(width / 2, cardY + 110, 'Tắt Unikey trước khi chơi để tránh lỗi bàn phím. [ESC] để thoát ra menu.', {
        fontSize: '12px',
        fontFamily: 'Bricolage Grotesque, sans-serif',
        color: '#6B6375',
    }).setOrigin(0.5);
    container.add(disclaimerText);

    // ── Keyboard diagram ──
    const keySize = 38;
    const keyGap = 6;
    const keyColor = 0x2d1b4e;
    const keyBorder = 0xb4a3fd;
    const keyAlpha = 0.6;
    const diagramCenterX = width / 2;
    const diagramTopY = cardY + 150;

    // Helper to draw a key
    function drawKey(cx: number, cy: number, label: string, w = keySize): Phaser.GameObjects.Container {
        const k = scene.add.container(cx, cy);

        // Key Shadow
        const shadow = scene.add.graphics();
        shadow.fillStyle(0x422670, 1);
        shadow.fillRect(-w / 2, -keySize / 2 + 3, w, keySize);
        k.add(shadow);

        const rect = scene.add.graphics();
        rect.fillStyle(keyColor, 1);
        rect.fillRect(-w / 2, -keySize / 2, w, keySize);
        rect.lineStyle(1, keyBorder, keyAlpha);
        rect.strokeRect(-w / 2, -keySize / 2, w, keySize);
        k.add(rect);

        const lbl = scene.add.text(0, 0, label, {
            fontSize: '11px',
            fontFamily: 'Bricolage Grotesque, sans-serif',
            color: '#C6B9DC',
        }).setOrigin(0.5);
        k.add(lbl);
        return k;
    }

    // WASD block
    const wasdX = diagramCenterX - 115;
    const wasdY = diagramTopY;

    const wKey = drawKey(wasdX, wasdY, 'W');
    container.add(wKey);
    const aKey = drawKey(wasdX - (keySize + keyGap), wasdY + keySize + keyGap, 'A');
    container.add(aKey);
    const sKey = drawKey(wasdX, wasdY + keySize + keyGap, 'S');
    container.add(sKey);
    const dKey = drawKey(wasdX + (keySize + keyGap), wasdY + keySize + keyGap, 'D');
    container.add(dKey);

    // VS divider
    const vsText = scene.add.text(diagramCenterX, diagramTopY + (keySize + keyGap) / 2, 'hoặc', {
        fontSize: '12px',
        fontFamily: 'Bricolage Grotesque, sans-serif',
        color: '#6B6375',
    }).setOrigin(0.5);
    container.add(vsText);

    // Arrow keys block
    const arrowX = diagramCenterX + 115;
    const arrowY = diagramTopY;

    const upKey = drawKey(arrowX, arrowY, '↑');
    container.add(upKey);
    const leftKey = drawKey(arrowX - (keySize + keyGap), arrowY + keySize + keyGap, '←');
    container.add(leftKey);
    const downKey = drawKey(arrowX, arrowY + keySize + keyGap, '↓');
    container.add(downKey);
    const rightKey = drawKey(arrowX + (keySize + keyGap), arrowY + keySize + keyGap, '→');
    container.add(rightKey);

    // ── Space bar hint ──
    if (config.showSpaceKey !== false) {
        const spaceY = diagramTopY + (keySize + keyGap) * 2 + 28;
        const spaceKey = drawKey(diagramCenterX, spaceY, 'SPACE — Nhảy qua hố đen', 200);
        container.add(spaceKey);
    }

    // ── "Press any key" prompt ──
    const promptText = scene.add.text(width / 2, cardY + cardH - 36, 'Nhấn phím bất kỳ để bắt đầu', {
        fontSize: '14px',
        fontFamily: 'Bricolage Grotesque, sans-serif',
        color: '#B4A3FD',
    }).setOrigin(0.5);

    // Blink animation
    scene.tweens.add({
        targets: promptText,
        alpha: { from: 1, to: 0.3 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
    });
    container.add(promptText);

    // ── Listen for first keypress ──
    let started = false;
    const keyHandler = () => {
        if (started) return;
        started = true;
        scene.tweens.killTweensOf(promptText);
        container.destroy();
        config.onStart();
    };

    // Phaser keyboard listener
    scene.input.keyboard?.once('keydown', keyHandler);

    // DOM fallback — only prevent default for Space (to stop scrolling)
    const domKeyHandler = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            e.preventDefault();
        }
        window.removeEventListener('keydown', domKeyHandler);
        keyHandler();
    };
    window.addEventListener('keydown', domKeyHandler);

    // Also allow click/tap to start
    bg.once('pointerdown', () => {
        window.removeEventListener('keydown', domKeyHandler);
        keyHandler();
    });

    return container;
}
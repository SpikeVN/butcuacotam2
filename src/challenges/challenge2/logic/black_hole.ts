import * as Phaser from 'phaser';

export interface BlackHoleConfig {
    cx: number;
    cy: number;
    cellSize: number;
    scene: Phaser.Scene;
}

/**
 * Renders a single animated black hole using Phaser Graphics + Tweens.
 * Designed to fit the dark purple maze aesthetic.
 */
export class BlackHoleRenderer {
    private readonly scene: Phaser.Scene;
    private readonly objects: Phaser.GameObjects.GameObject[] = [];

    constructor(config: BlackHoleConfig) {
        this.scene = config.scene;
        this.build(config.cx, config.cy, config.cellSize);
    }

    private build(cx: number, cy: number, cellSize: number): void {
        const r = cellSize * 0.38;

        // ── Layer 1: outer ambient glow (large soft circle) ─────────────────
        const ambient = this.scene.add.graphics();
        ambient.fillStyle(0x6d28d9, 0.12);
        ambient.fillCircle(0, 0, r * 2.0);
        ambient.setPosition(cx, cy);
        this.objects.push(ambient);

        this.scene.tweens.add({
            targets: ambient,
            alpha: { from: 0.5, to: 1 },
            scaleX: { from: 0.92, to: 1.08 },
            scaleY: { from: 0.92, to: 1.08 },
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut',
        });

        // ── Layer 2: warped floor tile — dark ellipse filling the cell ───────
        const floor = this.scene.add.graphics();
        floor.fillStyle(0x110822, 1);
        floor.fillCircle(0, 0, r * 1.15);
        floor.setPosition(cx, cy);
        this.objects.push(floor);

        // ── Layer 3: orbit rings (3 concentric dashed-look rings) ────────────
        const ringColors = [0x7c3aed, 0x9333ea, 0xc084fc];
        const ringRadii = [r * 0.95, r * 0.72, r * 0.50];
        const ringAlphas = [0.55, 0.45, 0.35];
        const ringWidths = [1.5, 1.2, 1.0];

        ringColors.forEach((color, i) => {
            const ring = this.scene.add.graphics();
            ring.lineStyle(ringWidths[i], color, ringAlphas[i]);
            ring.strokeCircle(0, 0, ringRadii[i]);
            ring.setPosition(cx, cy);
            this.objects.push(ring);

            // Each ring pulses at a slightly different phase
            this.scene.tweens.add({
                targets: ring,
                scaleX: { from: 0.88, to: 1.12 },
                scaleY: { from: 0.88, to: 1.12 },
                alpha: { from: ringAlphas[i] * 0.6, to: ringAlphas[i] * 1.4 },
                duration: 1000 + i * 280,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.InOut',
                delay: i * 200,
            });
        });

        // ── Layer 4: spinning arc segments (swirl illusion) ──────────────────
        const numArcs = 4;
        for (let a = 0; a < numArcs; a++) {
            const arc = this.scene.add.graphics();
            const startAngle = (a / numArcs) * Math.PI * 2;
            const endAngle = startAngle + Math.PI * 0.55;

            arc.lineStyle(2, 0xb07ef8, 0.65);
            arc.beginPath();
            arc.arc(0, 0, r * 0.82, startAngle, endAngle, false);
            arc.strokePath();
            arc.setPosition(cx, cy);
            this.objects.push(arc);
        }

        // Rotate the arcs container via a proxy object
        const rotProxy = { angle: 0 };
        const arcStart = this.objects.length - numArcs;
        const arcObjects = this.objects.slice(arcStart) as Phaser.GameObjects.Graphics[];

        this.scene.tweens.add({
            targets: rotProxy,
            angle: 360,
            duration: 2200,
            repeat: -1,
            ease: 'Linear',
            onUpdate: () => {
                arcObjects.forEach((arc, i) => {
                    arc.setAngle(rotProxy.angle + (i / numArcs) * 360);
                });
            },
        });

        // ── Layer 5: event horizon (solid dark disc) ─────────────────────────
        const horizon = this.scene.add.graphics();
        horizon.fillStyle(0x070311, 1);
        horizon.fillCircle(0, 0, r * 0.40);
        horizon.setPosition(cx, cy);
        this.objects.push(horizon);

        // ── Layer 6: center singularity spark ────────────────────────────────
        const spark = this.scene.add.graphics();
        spark.fillStyle(0xe9d5ff, 0.9);
        spark.fillCircle(0, 0, r * 0.08);
        spark.setPosition(cx, cy);
        this.objects.push(spark);

        this.scene.tweens.add({
            targets: spark,
            alpha: { from: 0.3, to: 1 },
            scaleX: { from: 0.5, to: 1.5 },
            scaleY: { from: 0.5, to: 1.5 },
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut',
        });

    }

    destroy(): void {
        this.objects.forEach(obj => obj.destroy());
    }

    /** Fade out all layers (dim the black hole) */
    fadeOut(duration = 200): void {
        this.objects.forEach(obj => {
            this.scene.tweens.add({
                targets: obj,
                alpha: 0.08,
                duration,
                ease: 'Sine.Out',
            });
        });
    }

    /** Fade back in to full visibility */
    fadeIn(duration = 300): void {
        this.objects.forEach(obj => {
            this.scene.tweens.add({
                targets: obj,
                alpha: 1,
                duration,
                ease: 'Sine.In',
            });
        });
    }
}

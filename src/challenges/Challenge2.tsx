import * as Phaser from "phaser";
import Selection from "./challenge2/Menu/Selection";
import Level1 from "./challenge2/Levels/level1";
import Level2 from "./challenge2/Levels/level2";
import Level3 from "./challenge2/Levels/level3";
import { onMount } from "solid-js";

export default function Challenge2() {
    onMount(() => {
        // Destroy any previous Phaser game instance (handles HMR properly)
        const existingCanvas = document.querySelector("#game-container canvas");
        if (existingCanvas) {
            // Phaser stores the game instance on the canvas
            const game = (window as any).__phaserGame;
            if (game) {
                game.destroy(true);
            }
            (window as any).__phaserGame = null;
        }

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 900,
            height: 500,
            parent: "game-container",
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            render: {
                antialias: true,
                roundPixels: true,
            },
            scene: [Selection, Level1, Level2, Level3],
        };

        const game = new Phaser.Game(config);
        (window as any).__phaserGame = game;

        // Cleanup on unmount
        return () => {
            game.destroy(true);
            (window as any).__phaserGame = null;
        };
    });

    return (
        <>
            <div class="w-full h-full" id="game-container"></div>
            <div style="font-family: 'Bricolage Grotesque'; visibility: hidden; position: absolute;">
                .
            </div>
            <div style="font-family: 'Cormorant Garamond'; visibility: hidden; position: absolute;">
                .
            </div>
        </>
    );
}

import * as Phaser from "phaser";
import Selection from "./challenge2/Menu/Selection";
import Level1 from "./challenge2/Levels/level1";
import Level2 from "./challenge2/Levels/level2";
import Level3 from "./challenge2/Levels/level3";
import { onMount } from "solid-js";

export default function Challenge2() {
    onMount(() => {
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

        new Phaser.Game(config);
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

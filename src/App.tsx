/**
 *  Mã nguồn của Bụt của Cô Tấm - Game tiền sự kiện DSTC 2026
 *  Copyright (C) 2026  CLB KHCN trong Kinh tế và Kinh doanh
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { createSignal, Match, Show, Switch, type Component } from "solid-js";
import { GameStage } from "./types";

import LoadingScreen from "./storyline/LoadingScreen";
import MainMenu from "./storyline/MainMenu";
import Game from "./storyline/Game";
import DevTools from "./components/DevTools";
import { registerEvent } from "./engine/events";
import NotificationSystem from "./components/winlib/NotificationSystem";
import {
    loadUserdata,
    handleSpellFromUrl,
    saveUserdata,
    setDataLoaded,
    dataLoaded,
    isMaintainance,
} from "./engine/userdata";
import Credits from "./storyline/Credits";

const App: Component = () => {
    const introShown = localStorage.getItem("introShown") === "true";
    let [stage, setStage] = createSignal(GameStage.LOADING_SCREEN);

    if (import.meta.env.DEV) {
        setStage(GameStage.LOADING_SCREEN);
    }

    registerEvent("changescreen_loading", () =>
        setStage(GameStage.LOADING_SCREEN),
    );
    registerEvent("changescreen_main_menu", () =>
        setStage(GameStage.MAIN_MENU),
    );
    registerEvent("changescreen_play", () => setStage(GameStage.PLAY));
    registerEvent("changescreen_saves", () => setStage(GameStage.SAVES));
    registerEvent("changescreen_settings", () => setStage(GameStage.SETTINGS));
    registerEvent("changescreen_credits", () => setStage(GameStage.CREDITS));

    loadUserdata().then((_) => {
        setDataLoaded(true);
    });

    setInterval(async () => {
        await saveUserdata();
    }, 60 * 1000);

    handleSpellFromUrl();

    document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState === "hidden") {
            await saveUserdata();
        }
    });

    return (
        <>
            <Show when={import.meta.env.DEV}>
                <DevTools currentStage={stage()} />
            </Show>
            <NotificationSystem />
            <Show when={dataLoaded()}>
                <Switch>
                    <Match when={isMaintainance()}>
                        <div class="w-[100vw] h-full flex items-center justify-center">
                            <h1 class="font-serif text-accent text-4xl italic text-center font-medium">
                                Bụt của Cô Tấm đang bảo trì. <br />
                                Xin vui lòng thử lại sau. Chúng mình rất xin lỗi vì sự bất
                                tiện này.
                            </h1>
                        </div>
                    </Match>
                    <Match
                        when={
                            !isMaintainance() &&
                            stage() == GameStage.LOADING_SCREEN
                        }
                    >
                        <LoadingScreen
                            skipLogos={introShown}
                            doneCallback={() => {
                                console.log("calling the next stage");
                                localStorage.setItem("introShown", "true");
                                setStage(GameStage.MAIN_MENU);
                            }}
                        />
                    </Match>
                    <Match
                        when={
                            !isMaintainance() && stage() == GameStage.MAIN_MENU
                        }
                    >
                        <MainMenu
                            doneCallback={(nextStage) => {
                                setStage(nextStage);
                            }}
                        />
                    </Match>
                    <Match
                        when={!isMaintainance() && stage() == GameStage.PLAY}
                    >
                        <Game />
                    </Match>
                    <Match
                        when={!isMaintainance() && stage() == GameStage.CREDITS}
                    >
                        <Credits />
                    </Match>
                </Switch>
            </Show>
        </>
    );
};

export default App;

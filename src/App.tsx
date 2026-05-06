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

import { createSignal, Match, Switch, type Component } from "solid-js";
import { GameStage } from "./types";

import LoadingScreen from "./storyline/LoadingScreen";
import MainMenu from "./storyline/MainMenu";
import Game from "./storyline/Game";
import { registerEvent } from "./engine/events";
import NotificationSystem from "./components/winlib/NotificationSystem";
import { loadUserdata } from "./engine/userdata";

const App: Component = () => {
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

    loadUserdata();

    return (
        <>
            <NotificationSystem />
            <Switch>
                <Match when={stage() == GameStage.LOADING_SCREEN}>
                    <LoadingScreen
                        doneCallback={() => {
                            console.log("calling the next stage");
                            setStage(GameStage.MAIN_MENU);
                        }}
                    />
                </Match>
                <Match when={stage() == GameStage.MAIN_MENU}>
                    <MainMenu
                        doneCallback={(nextStage) => {
                            setStage(nextStage);
                        }}
                    />
                </Match>
                <Match when={stage() == GameStage.PLAY}>
                    <Game />
                </Match>
            </Switch>
        </>
    );
};

export default App;

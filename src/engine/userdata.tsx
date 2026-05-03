import { UserData } from "../types";
import { setScript } from "./script";

export let userdata: UserData = {
    name: "Lân",
    email: "lan@cteftu.id.vn",
    currentSave: "default",
    saves: {
        default: {
            name: "Default Save",
            timestamp: 0,
            path: "intro_game1",
            index: 18,
        },
    },
};

export const loadUserdata = () => {
    const currentProgress = userdata.saves[userdata.currentSave];
    setScript({
        path: currentProgress.path,
        index: currentProgress.index,
    });
};

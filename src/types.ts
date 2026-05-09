export enum GameStage {
    LOADING_SCREEN,
    MAIN_MENU,
    PLAY,
    SAVES,
    SETTINGS,
    CREDITS,
}

export interface Progress {
    timestamp: number;
    path: string;
    index: number;
}

export interface UserData {
    name: string;
    email: string;
    progress: Progress ;
}

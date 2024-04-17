export enum WordState {
    normal,
    selected,
    guessed,
    solved,
    invisible
}

export enum WordPlace {
    list,
    guesses,
    solved,
}

export interface Word {
    text: string,
    place?: WordPlace,
    state?: WordState,
}
export enum WordState {
    normal,
    selected,
    guessed,
    coupled,
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
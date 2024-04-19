export enum WordState {
    normal,
    selected,
    guessed,
    lastGuess,
    coupled,
    invisible
}

export enum WordPlace {
    list,
    guesses,
    coupled,
}

export interface Word {
    text: string,
    place?: WordPlace,
    state?: WordState,
}
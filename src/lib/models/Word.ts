export enum WordState {
    normal,
    selected,
    guessed,
    lastGuess,
    coupled,
    invisible
}

export type Word = string;
export type Words = Word[];
export interface WordButton {
    text: Word,
    state?: WordState,
}
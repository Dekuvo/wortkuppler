export enum WordState {
    normal,
    selected,
    guessed,
    solved,
    invisible
}

export interface Word {
    text: string,
    state?: WordState,
}
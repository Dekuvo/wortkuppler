export enum GameState {
    guessing,
    mistake,
    lastGuess,
    lost,
    won,
}


export default interface Game {
    state:GameState;
    words:string[];
    guesses:string[];
    coupled:string[];
    mistakes:string[][];
    maxMistakes: number;
}
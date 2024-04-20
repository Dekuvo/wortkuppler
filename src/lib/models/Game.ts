
import { derived, get, writable, type Invalidator, type Readable, type Subscriber, type Unsubscriber, type Updater, type Writable } from 'svelte/store';
import type { Riddle, RiddleGroupId } from './Riddle';
import type { Word, Words } from './Word';


export enum GamePhase {
    playing,
    mistaken,
    last,
    lost,
    won,
}

export interface GameGuess {
    words: string[],
    group?: RiddleGroupId,
}

export interface GameState {
    riddle: string;
    phase: GamePhase;
    selected: Words;
    guesses: GameGuess[];
}

export class Game {

    public readonly riddle: Riddle;
    private gameState: Writable<GameState>;
    private mistakesAllowed: number;

    public readonly selectedEmpty: Readable<boolean>;
    public readonly selectedMaxed: Readable<boolean>;
    public readonly uncoupledWords: Readable<Words>;
    public readonly mistakesRemaining: Readable<number>;
    public readonly percentage: Readable<number>;

    constructor(riddle: Riddle) {

        // for easier access, collect all the words in their corresponding groups (like a cache)
        for (const group in riddle.groups) riddle.groups[group].words = [];
        for (const word in riddle.words) {
            const groupId = riddle.words[word];
            if (groupId in riddle.groups) {
                riddle.groups[groupId].words!.push(word);
            }
        }

        this.mistakesAllowed = riddle.mistakesAllowed ?? Object.keys(riddle.groups).length;

        this.riddle = riddle;
        this.gameState = writable<GameState>({
            riddle: riddle.id,
            phase: GamePhase.playing,
            selected: [],
            guesses: [],
        });
        this.selectedEmpty = derived(this.gameState, gameState => this.selected.length <= 0);
        this.selectedMaxed = derived(this.gameState, gameState => this.isSelectedMaxed());
        this.uncoupledWords = derived(this.gameState, gameState => this.getUncoupledWords());
        this.mistakesRemaining = derived(this.gameState, gameState => this.getMistakesRemaining());
        this.percentage = derived(this.gameState, gameState => this.couples.length / this.groupCount);
    }

    // #region: riddle methods

    public get words() {
        return Object.keys(this.riddle.words);
    }

    public getUncoupledWords() {
        
        return this.words.filter(word => !this.couples.includes(this.riddle.words[word]));
    }

    public get wordCount() {
        return this.words.length;
    }

    public get groups() {
        return this.riddle.groups;
    }

    public get groupCount() {
        return Object.keys(this.riddle.groups).length;
    }

    // #endregion

    // #region: game methods

    public get phase() {
        return get(this.gameState).phase;
    }

    public set phase(phase: GamePhase) {
        this.gameState.update(game => {
            game.phase = phase;
            return game;
        })
    }

    public get selected() {
        return get(this.gameState).selected;
    }

    public set selected(selected: Words) {
        this.gameState.update(game => {
            game.selected = selected;
            return game;
        })
    }

    public isWordSelected(word: Word) {
        return this.selected.includes(word);
    }

    public isWordSelectable(word: Word) {
        return !this.isSelectedMaxed() && !this.isWordSelected(word);
    }

    public isSelectedMaxed() {
        return this.selected.length >= this.riddle.wordsPerGroup;
    }

    public select(word: Word): boolean {
        this.phase = GamePhase.playing;

        if (!this.isWordSelectable(word)) return false;
        this.gameState.update(game => {
            game.selected.push(word);
            return game;
        })
        if (this.isSelectedMistake()) this.phase = GamePhase.mistaken;
        return true;
    }

    public deselect(word: Word): boolean {
        if (this.phase === GamePhase.last) return false;
        this.phase = GamePhase.playing;
        this.selected = this.selected.filter(select => select !== word);
        return true;
    }

    public clear(): boolean {
        if (this.phase === GamePhase.last) return false;

        this.phase = GamePhase.playing;
        this.selected = [];
        return true;
    }

    // TODO: do we need GamePhase.mistaken or can we use this function instead? 
    // then we don't need to set GamePhase.playing in select/deselect/clear
    public isSelectedMistake(): boolean {
        if (!this.isSelectedMaxed()) return false;
        const guess = this.searchSelectedInGuesses();
        return typeof guess !== 'undefined' && guess.group === 'undefined';
    }

    public get guesses() {
        return get(this.gameState).guesses;
    }

    public addGuess(guess: GameGuess): boolean {
        console.log(this.isSelectedMaxed())
        if (!this.isSelectedMaxed()) return false;
        console.log(guess)
        this.gameState.update(game => {
            game.guesses.push(guess);
            return game;
        })
        return true;
    }

    public searchSelectedInGuesses(): GameGuess | undefined {
        if (!this.isSelectedMaxed()) return undefined;
        return this.guesses.find(guess => this.selected.sort().join() == guess.words.sort().join());
    }

    public get couples() {
        return this.guesses.reduce<RiddleGroupId[]>((couples, guess) => typeof guess.group !== 'undefined' ? [...couples, guess.group] : couples, new Array<RiddleGroupId>())
    }

    public get mistakes() {
        return this.guesses.reduce<Words[]>((mistakes, guess) => typeof guess.group === 'undefined' ? [...mistakes, guess.words] : mistakes, new Array<Words>())
    }

    public getMistakesRemaining() {
        return this.mistakesAllowed - this.mistakes.length;
    }

    /**
     * Determine the maximum count of currently selected words, belonging to the same group
     */
    public getMaxCorrelation() {

        // for each group, count how many of the guessed words are in it
        let counts = Object.fromEntries(Object.keys(this.riddle.groups).map((key) => [key, 0]));
        this.selected.forEach((word) => {
            counts[this.riddle.words[word]]++;
        });

        return Math.max(...Object.values(counts));
    }

    public get coupleCount() {
        return this.couples.length;
    }

    public couple() {

        if (!this.isSelectedMaxed()) return false;

        const guess: GameGuess = {
            words: this.selected,
        }

        // if all the guesses belong to one group, this group is correctly solved
        if (this.getMaxCorrelation() >= this.riddle.wordsPerGroup) {
            const group = this.riddle.words[this.selected[0]];
            guess.group = group;
            
            const coupled = this.couples;
            if (!coupled.includes(group)) {
                
                this.addGuess(guess);
                this.clear();

                const remainingCount = this.groupCount - this.coupleCount;
                if (remainingCount <= 0) {
                    // if all groups are solved, the this is won
                    this.phase = GamePhase.won;
                } else if (remainingCount === 1) {
                    // if only one group remains, preselect it for the user
                    this.phase = GamePhase.last;
                    for (const word in this.riddle.words) {

                        if (!coupled.includes(this.riddle.words[word]))
                            this.select(word);
                    }

                }
            }
        } else {
            this.addGuess(guess);
            this.phase = GamePhase.mistaken;
            // if the number of mistakes exceeds the maximum, the game is lost
            if (this.getMistakesRemaining() <= 0) this.phase = GamePhase.lost;
        }
        
    }

    // public get percentage() {
    //     return this.couples.length / this.groupCount;
    // }

    // #endregion

    // #region: store methods

    set(value: GameState): void {
        this.gameState.set(value);
    }

    update(updater: Updater<GameState>): void {
        this.gameState.update(updater);
    }

    subscribe(run: Subscriber<GameState>, invalidate?: Invalidator<GameState>): Unsubscriber {
        return this.gameState.subscribe(run, invalidate);
    }

    // #endregion


}

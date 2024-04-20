
import { derived, get, writable, type Invalidator, type Readable, type Subscriber, type Unsubscriber, type Updater, type Writable } from 'svelte/store';
import type { Riddle, RiddleGroupId } from './Riddle';
import type { Word, Words } from './Word';

// #region: type declarations

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
    selection: Words;
    guesses: GameGuess[];
}
// #endregion


export class Game {

    // #region: properties

    public readonly riddle: Riddle;
    private gameState: Writable<GameState>;
    private mistakesAllowed: number;

    public readonly derived: {
        phase: Readable<GamePhase>;
        selectionEmpty: Readable<boolean>;
        selectionFull: Readable<boolean>;
        uncoupledWords: Readable<Words>;
        coupledGroups: Readable<Array<RiddleGroupId>>;
        mistakesRemaining: Readable<number>;
        percentage: Readable<number>;
    }

    // #endregion

    // #region: constructor

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
            selection: [],
            guesses: [],
        });

        // create several derivates using the svelte derived store
        this.derived = {
            phase: derived(this.gameState, gameState => this.getPhase()),
            selectionEmpty: derived(this.gameState, gameState => this.selection.length <= 0),
            selectionFull: derived(this.gameState, gameState => this.isSelectionFull()),
            uncoupledWords: derived(this.gameState, gameState => this.uncoupledWords),
            coupledGroups: derived(this.gameState, gameState => this.couples),
            mistakesRemaining: derived(this.gameState, gameState => this.getMistakesRemaining()),
            percentage: derived(this.gameState, gameState => this.couples.length / this.groupCount),
        }
    }

    // #endregion

    // #region: riddle methods

    public get words() {
        return Object.keys(this.riddle.words);
    }

    public get uncoupledWords() {
        return this.words.filter(word => !this.couples.includes(this.riddle.words[word]));
    }

    public get wordCount() {
        return this.words.length;
    }

    public get groupIds() {
        return Object.keys(this.riddle.groups);
    }

    public get groupCount() {
        return this.groupIds.length;
    }

    public getGroupById(groupId: RiddleGroupId) {
        return this.riddle.groups[groupId];
    }

    // #endregion

    // #region: game actions

    public select(word: Word): boolean {
        if (!this.isWordSelectable(word)) return false;
        this.selection = [...this.selection, word];

        return true;
    }

    public deselect(word: Word): boolean {
        if (this.isLastCouple()) return false;
        this.selection = this.selection.filter(select => select !== word);
        return true;
    }

    public clearSelection(): boolean {
        if (this.isLastCouple()) return false;
        this.selection = [];
        return true;
    }

    /**
     * Adds current selection to guesses, and if correct, clears selection.
     * If only one group remains afterwards, it gets preselected.
     * @returns {boolean} true if selection was a valid group, otherwise false
     */
    public coupleSelection(): boolean {

        if (!this.isSelectionFull()) return false;

        const guess: GameGuess = {
            words: this.selection,
        }

        // if all the guesses belong to one group, this group is correctly solved
        if (this.getMaxCorrelation() >= this.riddle.wordsPerGroup) {
            const group = this.riddle.words[this.selection[0]];
            guess.group = group;

            const coupled = this.couples;
            if (!coupled.includes(group)) {

                this.guesses = [...this.guesses, guess];
                this.clearSelection();

                // if only one group remains, preselect it's words for the user
                if (this.isLastCouple()) this.selection = this.uncoupledWords;
                return true;
            }
        } else {
            this.guesses = [...this.guesses, guess];
        }
        return false;
    }

    // #endregion




    // #region: game checks

    public isWordSelectable(word: Word) {
        return !this.isSelectionFull() && !this.selection.includes(word);
    }

    public isSelectionFull() {
        return this.selection.length >= this.riddle.wordsPerGroup;
    }

    /**
     * Checks wether the current selection was previously guessed and is therefore a mistake
     * @returns {boolean} true if previously guessed and was a mistake, otherwise false
     */
    public isSelectionMistake(): boolean {
        if (!this.isSelectionFull()) return false;
        // try to find current selection in previous guesses
        const guess = this.guesses.find(guess => this.selection.sort().join() == guess.words.sort().join());
        return typeof guess !== 'undefined' && typeof guess.group === 'undefined';
    }

    public isLastCouple() {
        return this.groupCount - this.couples.length == 1;
    }

    // #endregion

    // #region: helper functions

    /**
     * Derives the phase of the game by the values of the GameState
     * @returns {GamePhase} 
     */
    public getPhase() {
        if (this.uncoupledWords.length <= 0) return GamePhase.won;
        if (this.getMistakesRemaining() <= 0) return GamePhase.lost;
        if (this.isLastCouple()) return GamePhase.last;
        if (this.isSelectionMistake()) return GamePhase.mistaken;
        return GamePhase.playing;
    }

    public getMistakesRemaining() {
        return this.mistakesAllowed - this.mistakes.length;
    }

    /**
     * Determine the maximum count of words in current selection, that belong to the same group
     * @returns {number}
     */
    public getMaxCorrelation(): number {

        // for each group, count how many of the guessed words are in it
        let counts = Object.fromEntries(Object.keys(this.riddle.groups).map((key) => [key, 0]));
        this.selection.forEach((word) => {
            counts[this.riddle.words[word]]++;
        });

        return Math.max(...Object.values(counts));
    }


    // #endregion

    // #region: store methods

    public get selection() {
        return get(this.gameState).selection;
    }

    public set selection(selection: Words) {
        this.gameState.update(game => {
            game.selection = selection;
            return game;
        })
    }

    public get guesses() {
        return get(this.gameState).guesses;
    }

    public set guesses(guesses: GameGuess[]) {
        this.gameState.update(game => {
            game.guesses = guesses;
            return game;
        })
    }

    // derived from guesses
    public get couples() {
        return this.guesses.reduce<RiddleGroupId[]>((couples, guess) => typeof guess.group !== 'undefined' ? [...couples, guess.group] : couples, new Array<RiddleGroupId>())
    }

    // derived from guesses
    public get mistakes() {
        return this.guesses.reduce<Words[]>((mistakes, guess) => typeof guess.group === 'undefined' ? [...mistakes, guess.words] : mistakes, new Array<Words>())
    }


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

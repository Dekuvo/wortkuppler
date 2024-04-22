
import { derived, get, writable, type Invalidator, type Readable, type Subscriber, type Unsubscriber, type Updater, type Writable } from 'svelte/store';
import type { Riddle, RiddleGroupId, RiddleId } from './Riddle';
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
    words: Words,
    group?: RiddleGroupId,
}

export interface GameState {
    riddle: RiddleId;
    selection: Words;
    guesses: GameGuess[];
}
// #endregion


export class Game {

    // #region: properties

    public readonly riddle: Riddle;
    private gameState: Writable<GameState>;

    public readonly derived: {
        phase: Readable<GamePhase>;
        selectionEmpty: Readable<boolean>;
        selectionFull: Readable<boolean>;
        uncoupledWords: Readable<Words>;
        coupledGroupIds: Readable<Array<RiddleGroupId>>;
        mistakesRemaining: Readable<number>;
        percentage: Readable<number>;
    }

    // #endregion

    // #region: constructor

    // TODO: optional second argument to load an existing game
    constructor(riddle: Riddle) {

        // store all the words in the corresponding groups of the riddles (cache, overwrites)
        for (const group in riddle.groups) riddle.groups[group].words = [];
        for (const word in riddle.words) {
            const groupId = riddle.words[word];
            if (groupId in riddle.groups) {
                riddle.groups[groupId].words!.push(word);
            }
        }

        // TODO: verify riddle (groupCount * wordsPerGroup = wordCount, length of each group == wordsPerGroup)
        // TODO: alternative: wordsPerGroup is automatically derived by wordCount / groupCount => must be integer, words evenly distributed
        // if( riddle.wordsPerGroup > 4 ) throw new Error('riddle invalid, too many words per group');

        this.riddle = riddle;
        this.gameState = writable<GameState>({
            riddle: riddle.id,
            selection: [],
            guesses: [],
        });

        // create several derivates using svelte derived stores, to hide the calculations from the components that use them
        this.derived = {
            phase: derived(this.gameState, gameState => this.getPhase()),
            selectionEmpty: derived(this.gameState, gameState => this.selection.length <= 0),
            selectionFull: derived(this.gameState, gameState => this.isSelectionFull()),
            uncoupledWords: derived(this.gameState, gameState => this.uncoupledWords),
            coupledGroupIds: derived(this.gameState, gameState => this.coupledGroupIds),
            mistakesRemaining: derived(this.gameState, gameState => this.getMistakesRemaining()),
            percentage: derived(this.gameState, gameState => this.coupledGroupIds.length / this.groupIds.length ),
        }
    }

    // #endregion

    // #region: riddle methods

    public get words() {
        return Object.keys(this.riddle.words);
    }

    public get uncoupledWords() {
        return this.words.filter(word => !this.coupledGroupIds.includes(this.riddle.words[word]));
    }

    public get wordCount() {
        return this.words.length;
    }

    public get groupIds() {
        return Object.keys(this.riddle.groups);
    }

    public getGroupById(groupId: RiddleGroupId) {
        return this.riddle.groups[groupId];
    }

    // #endregion

    // #region: game actions

    public select(word: Word): boolean {
        if (this.isSelectionFull() || this.selection.includes(word)) return false;
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

            const coupled = this.coupledGroupIds;
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
        return this.groupIds.length - this.coupledGroupIds.length == 1;
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
        return (this.riddle.mistakesAllowed ?? this.groupIds.length) - this.mistakenGuesses.length;
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
    public get coupledGroupIds() {
        return this.guesses.reduce<RiddleGroupId[]>((couples, guess) => typeof guess.group !== 'undefined' ? [...couples, guess.group] : couples, new Array<RiddleGroupId>())
    }

    // derived from guesses
    public get mistakenGuesses():Words[] {
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

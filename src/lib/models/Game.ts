
import { derived, get, writable, type Invalidator, type Readable, type Subscriber, type Unsubscriber, type Updater, type Writable } from 'svelte/store';
import type { Puzzle, PuzzleGroupId, PuzzleId } from './Puzzle';
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
    group?: PuzzleGroupId,
}

export interface GameState {
    puzzle: PuzzleId;
    selection: Words;
    guesses: GameGuess[];
}
// #endregion


export class PuzzleError extends Error { }
export class GameError extends Error { }


export class Game {

    // #region: properties

    public readonly puzzle: Puzzle;
    private gameState: Writable<GameState>;

    public readonly derived: {
        phase: Readable<GamePhase>;
        selectionEmpty: Readable<boolean>;
        selectionFull: Readable<boolean>;
        uncoupledWords: Readable<Words>;
        coupledGroupIds: Readable<Array<PuzzleGroupId>>;
        mistakesRemaining: Readable<number>;
        percentage: Readable<number>;
    };

    // #endregion

    // #region: constructor

    constructor(puzzle: Puzzle, state?:GameState) {

        this.validatePuzzle(puzzle);

        // store all the words in the corresponding groups of the puzzles (cache, overwrites)
        // TODO: consider moving this into the game properties, so the puzzle is immutable and won't offer possibility for storing contradictig data
        for (const group in puzzle.groups) puzzle.groups[group].words = [];
        for (const word in puzzle.words) {
            const groupId = puzzle.words[word];
            if (groupId in puzzle.groups) {
                puzzle.groups[groupId].words!.push(word);
            }
        }

        this.puzzle = puzzle;

        // load default (unplayed) GameState if none is provided
        if (typeof state === 'undefined') {
           state = {
                puzzle: puzzle.id,
                selection: [],
                guesses: [],
            };
        } else this.validateGameState(state);

        this.gameState = writable<GameState>(state);

        // create several derivates using svelte derived stores, to hide the calculations from the components that use them
        this.derived = {
            phase: derived(this.gameState, gameState => this.getPhase()),
            selectionEmpty: derived(this.gameState, gameState => this.selection.length <= 0),
            selectionFull: derived(this.gameState, gameState => this.isSelectionFull()),
            uncoupledWords: derived(this.gameState, gameState => this.uncoupledWords),
            coupledGroupIds: derived(this.gameState, gameState => this.coupledGroupIds),
            mistakesRemaining: derived(this.gameState, gameState => this.getMistakesRemaining()),
            percentage: derived(this.gameState, gameState => this.coupledGroupIds.length / this.groupIds.length),
        };
    }

    private validateGameState(state:GameState) {
        if ( state.puzzle !== this.puzzle.id ) throw new GameError('loaded game state is for different puzzle');
        if( !state.selection.every(word => word in this.puzzle.words) ) throw new GameError('unknown words in selection of game state');
        state.guesses.forEach((guess, index) => {
            if( !guess.words.every(word => word in this.puzzle.words) ) throw new GameError(`unknown words in guess #${index} of game state`);
            if( guess.group && !this.groupIds.includes(guess.group) ) throw new GameError(`unknown group ${guess.group} in guess #${index} of game state`);
        });
    }

    // #endregion

    // #region: puzzle methods

    private validatePuzzle(puzzle: Puzzle) {

        const groupCount = Object.keys(puzzle.groups).length;
        const wordCount = Object.keys(puzzle.words).length;
        if (groupCount <= 0) throw new PuzzleError('no groups in puzzle');
        if (wordCount <= 0) throw new PuzzleError('no words in puzzle');

        // words should be evenly divided between groups
        if (wordCount % groupCount !== 0)
            throw new Error('assymetric word to group mapping');

        // calculate the frequency of each group among words
        const frequencies = Object.keys(puzzle.groups).map(group => 0);
        Object.values(puzzle.words).forEach(group => {
            const index = Object.keys(puzzle.groups).indexOf(group);
            frequencies[index]! = (frequencies[index] ?? 0) + 1;
        });
        const wordsPerGroup = Math.trunc( wordCount / groupCount );
        if( Math.max(...frequencies) !== wordsPerGroup || Math.min(...frequencies) !== wordsPerGroup )
            throw new Error('assymetric word to group mapping');
        
    }

    public get words() {
        return Object.keys(this.puzzle.words);
    }

    public get wordCount() {
        return this.words.length;
    }

    public get uncoupledWords() {
        return this.words.filter(word => !this.coupledGroupIds.includes(this.puzzle.words[word]));
    }

    public get groupIds() {
        return Object.keys(this.puzzle.groups);
    }

    public getGroupById(groupId: PuzzleGroupId) {
        return this.puzzle.groups[groupId];
    }

    public get wordsPerGroup() {
        return Math.trunc( this.wordCount / this.groupIds.length );
    }


    // #endregion

    // #region: game checks

    public isSelectionFull() {
        return this.selection.length >= this.wordsPerGroup;
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
        };

        // if all the guesses belong to one group, this group is correctly solved
        if (this.getMaxCorrelation() >= this.wordsPerGroup) {
            const group = this.puzzle.words[this.selection[0]];
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

    // #region: helper functions

    public getMistakesRemaining() {
        return (this.puzzle.mistakesAllowed ?? this.groupIds.length) - this.mistakenGuesses.length;
    }

    /**
     * Determine the maximum count of words in current selection, that belong to the same group
     * @returns {number}
     */
    public getMaxCorrelation(): number {

        // for each group, count how many of the guessed words are in it
        let counts = Object.fromEntries(Object.keys(this.puzzle.groups).map((key) => [key, 0]));
        this.selection.forEach((word) => {
            counts[this.puzzle.words[word]]++;
        });

        return Math.max(...Object.values(counts));
    }

    /**
     * Derives the phase of the game by the values of the GameState
     * @returns {GamePhase} 
     */
    public getPhase() {
        if (this.getMistakesRemaining() <= 0) return GamePhase.lost;
        if (this.uncoupledWords.length <= 0) return GamePhase.won;
        if (this.isLastCouple()) return GamePhase.last;
        if (this.isSelectionMistake()) return GamePhase.mistaken;
        return GamePhase.playing;
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
        });
    }

    public get guesses() {
        return get(this.gameState).guesses;
    }

    public set guesses(guesses: GameGuess[]) {
        this.gameState.update(game => {
            game.guesses = guesses;
            return game;
        });
    }

    // derived from guesses
    public get coupledGroupIds() {
        return this.guesses.reduce<PuzzleGroupId[]>((couples, guess) => typeof guess.group !== 'undefined' ? [...couples, guess.group] : couples, new Array<PuzzleGroupId>());
    }

    // derived from guesses
    public get mistakenGuesses(): Words[] {
        return this.guesses.reduce<Words[]>((mistakes, guess) => typeof guess.group === 'undefined' ? [...mistakes, guess.words] : mistakes, new Array<Words>());
    }

    /* v8 ignore start */
    set(value: GameState): void {
        this.gameState.set(value);
    }

    update(updater: Updater<GameState>): void {
        this.gameState.update(updater);
    }

    subscribe(run: Subscriber<GameState>, invalidate?: Invalidator<GameState>): Unsubscriber {
        return this.gameState.subscribe(run, invalidate);
    }
    /* v8 ignore stop */

    // #endregion


}

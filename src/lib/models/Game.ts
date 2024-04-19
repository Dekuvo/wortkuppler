
import { get, writable, type Invalidator, type Subscriber, type Unsubscriber, type Updater, type Writable } from 'svelte/store';
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
    private game: Writable<GameState>;
    private mistakesAllowed: number;

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
        this.game = writable<GameState>({
            riddle: riddle.id,
            phase: GamePhase.playing,
            selected: ['eins', 'zwei'],
            guesses: [],
        });
    }

    // #region: riddle methods

    public get words() {
        return Object.keys(this.riddle.words);
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
        return get(this.game).phase;
    }

    public set phase(phase: GamePhase) {
        this.game.update(game => {
            game.phase = phase;
            return game;
        })
    }

    public get selected() {
        return get(this.game).selected;
    }

    public set selected(selected: Words) {
        this.game.update(game => {
            game.selected = selected;
            return game;
        })
    }

    public isSelectedMaxed() {
        return this.selected.length >= this.riddle.wordsPerGroup;
    }

    public select(word: Word): boolean {
        this.phase = GamePhase.playing;
        if (this.isSelectedMaxed()) return false;
        this.game.update(game => {
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
        if (!this.isSelectedMaxed) return false;
        const guess = this.searchSelectedInGuesses();
        return typeof guess !== 'undefined' && guess.group === 'undefined';
    }

    public get guesses() {
        return get(this.game).guesses;
    }

    public addGuess(guess: GameGuess): boolean {
        if (!this.isSelectedMaxed()) return false;
        this.game.update(game => {
            game.guesses.push(guess);
            return game;
        })
        return true;
    }

    public searchSelectedInGuesses(): GameGuess | undefined {
        if (!this.isSelectedMaxed) return undefined;
        return this.guesses.find(guess => this.selected.sort().join() == guess.words.sort().join());
    }

    public get couples() {
        return this.guesses.reduce<RiddleGroupId[]>((couples, guess) => typeof guess.group !== 'undefined' ? [...couples,guess.group] : couples , new Array<RiddleGroupId>())
    }

    public get mistakes() {
        return this.guesses.reduce<Words[]>((mistakes, guess) => typeof guess.group === 'undefined' ? [...mistakes,guess.words] : mistakes , new Array<Words>())
    }

    public get coupleCount() {
        return this.couples.length;
    }

    // #endregion

    public couple() {

        if (!this.isSelectedMaxed) return false;

        const guess: GameGuess = {
            words: this.selected,
        }

        // for each group, count how many of the guessed words are in it
        let counts = Object.fromEntries(Object.keys(this.riddle.groups).map((key) => [key, 0]));
        this.selected.forEach((word) => {
            counts[this.riddle.words[word]]++;
        });

        // if all the guesses belong to one group, this group is correctly solved
        const maxCorrelation = Math.max(...Object.values(counts));
        if (maxCorrelation >= this.riddle.wordsPerGroup) {
            const group = this.riddle.words[this.selected[0]];
            guess.group = group;
            const coupled = this.couples;
            if (!coupled.includes(group)) {

                this.clear();

                const remainingCount = this.groupCount - this.coupleCount;
                if (remainingCount <= 0) {
                    // if all groups are solved, the this is won
                    this.phase = GamePhase.won;
                } else if (remainingCount === 1) {
                    // if only one group remains, preselect it for the user
                    this.phase = GamePhase.last;
                    for( const word in this.riddle.words ) {

                        if (!coupled.includes(this.riddle.words[word]))
                            this.select(word);
                    }

                }
            }
        } else {
            this.phase = GamePhase.mistaken;
            // if the number of mistakes exceeds the maximum, the game is lost
            if (this.mistakes.length >= this.mistakesAllowed) this.phase = GamePhase.lost;
        }
        this.addGuess(guess);
    }

    // #region: store methods

    set(value: GameState): void {
        this.game.set(value);
    }

    update(updater: Updater<GameState>): void {
        this.game.update(updater);
    }

    subscribe(run: Subscriber<GameState>, invalidate?: Invalidator<GameState>): Unsubscriber {
        return this.game.subscribe(run, invalidate);
    }

    // #endregion


}

export function createGameStore($riddle: Riddle) {


    const game: GameState = {
        riddle: riddle.id,
        phase: GamePhase.playing,
        selected: [],
        guesses: [],
    };

    const { subscribe, update } = writable(game);
    const words: Words = Object.keys(riddle.words);
    const maxMistakes = riddle.mistakesAllowed ?? Object.keys(riddle.groups).length;

    return {
        subscribe,
        select: (guess: Word) => {
            if (game.selected.length >= riddle.wordsPerGroup) return false;
            update($game => {
                $game.selected.push(guess);
                return $game
            });
            return true;
        },
        getWords: () => {
            return Object.keys(riddle.words)
        },
        isSelectedMaxed: () => {
            return game.selected.length >= riddle.wordsPerGroup;
        },
        isAlreadyGuessed: () => {
            return this.isSelectedMaxed() && game.guesses.some((guess) => game.guesses.sort().join() == mistake.sort().join())
        },
        setState: (state: GamePhase) => {
            update($game => {
                $game.phase = state;
                return $game;
            });
        },

    };
} 
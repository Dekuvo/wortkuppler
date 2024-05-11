import type { Word, Words } from "./Word";

export type PuzzleId = string;
export type PuzzleGroupId = string;

export interface PuzzleGroup {
    title: string;
    infos?: string;
    url?: string;
    words?: Words;
}

export type PuzzleGroups = {
    [key: PuzzleGroupId]: PuzzleGroup;
};

export type PuzzleWords = {
    [key: Word]: PuzzleGroupId;
};

export interface Puzzle {
    id: PuzzleId;
    groups: PuzzleGroups;
    words: PuzzleWords;
    score?:number;
    mistakesAllowed?:number;
}

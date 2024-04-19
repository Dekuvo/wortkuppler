import type { Word, Words } from "./Word";

export type RiddleId = string;
export type RiddleGroupId = string;

export interface RiddleGroup {
    title: string;
    infos: string;
    url?: string;
    words?: Words;
}

export type RiddleGroups = {
    [key: RiddleGroupId]: RiddleGroup;
};

export type RiddleWords = {
    [key: Word]: RiddleGroupId;
};

export interface Riddle {
    id: RiddleId;
    wordsPerGroup: number;
    groups: RiddleGroups;
    words: RiddleWords;
    score?:number;
    mistakesAllowed?:number;
}

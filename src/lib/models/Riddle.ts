export interface RiddleGroup {
    title: string;
    infos: string;
    url?: string;
    words?: string[];
}

export type RiddleGroups = {
    [key: string]: RiddleGroup;
};

export type RiddleWords = {
    [key: string]: string;
};

export interface Riddle {
    id: string;
    wordsPerGroup: number;
    groups: RiddleGroups;
    words: RiddleWords;
    score?:number;
    mistakes?:number;
}

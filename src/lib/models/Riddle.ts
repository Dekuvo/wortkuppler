
export type RiddleWords = {
    [key: string]: number | null;
};

export interface RiddleGroup {
    title: string;
    infos: string;
    url?: string;
    words: RiddleWords;
}

export interface Riddle {
    id: string;
    groups: RiddleGroup[];
    score?:number;
}

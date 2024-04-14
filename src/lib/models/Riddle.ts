
export interface RiddleGroup {
    title: string;
    infos: string;
    url?: string;
    words: string[];
}

export interface Riddle {
    id: string;
    groups: RiddleGroup[];
    order?:number[];
    score?:number;
}

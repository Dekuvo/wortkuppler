import type { Puzzle, PuzzleWords } from '$lib/models/Puzzle';

export let puzzle: Puzzle = {
    id: '123456',
    groups: {
        olympisch: {
            title: 'Olympisch 2024',
            infos: 'Werden bei den Olympischen Sommerspielen 2024 in Paris ausgetragen.',
            url: 'https://olympics.com/de/sportarten/summer-olympics#tabfaqGuid-ddf78406-4aea-4bba-a5ea-b3b49f49f5f5'
        },
        automodell: {
            title: 'Automodelle',
            infos:
                'VW Polo, Seat Ibiza, Ford Mustang und der Fiat Panda sind beliebte Modelle dieser Hersteller.'
        },
        kanaren: {
            title: 'Kanarische Inseln',
            infos: 'Dies sind 4 der insgesamt 7 Inseln, die zu den Kanaren zählen.',
            url: 'https://de.wikipedia.org/wiki/Kanarische_Inseln#Geographie'
        },
        likoerwein: {
            title: 'Likörweine',
            infos: 'Bekannte Dessert- oder auch Süßweine',
            url: 'https://de.wikipedia.org/wiki/Lik%C3%B6rwein#Bekannte_Lik%C3%B6rweine'
        }
    },
    words: {
        Fechten: 'olympisch',
        Sherry: 'likoerwein',
        Ibiza: 'automodell',
        Teneriffa: 'kanaren',
        Madeira: 'likoerwein',
        Fuerteventura: 'kanaren',
        Judo: 'olympisch',
        Mustang: 'automodell',
        Port: 'likoerwein',
        Lanzarote: 'kanaren',
        Polo: 'automodell',
        Golf: 'olympisch',
        'La Gomera': 'kanaren',
        Boxen: 'olympisch',
        Panda: 'automodell',
        Marsala: 'likoerwein',
    }
};
import { type Readable, get } from 'svelte/store';

import { Game, GamePhase } from './Game';

const testRiddle = {
    id: '1',
    wordsPerGroup: 2,
    groups: {
        'group1': { title: 'Group 1' },
        'group2': { title: 'Group 2' },
    },
    words: {
        'Word 1': 'group1',
        'Word 2': 'group1',
        'Word 3': 'group2',
        'Word 4': 'group2',
    }
}


describe('Game creation', () => {
    it('initializes correctly', () => {
        const game = new Game(testRiddle);
        expect(game).toBeInstanceOf(Game);
        expect(game.riddle).toStrictEqual(testRiddle);
        expect(game.selection).toEqual([]);
        expect(game.guesses).toEqual([]);
    });

    it('caches words in riddle groups', () => {
        const game = new Game(testRiddle);
        expect.soft(game.riddle.groups['group1'].words).toEqual(['Word 1', 'Word 2']);
        expect.soft(game.riddle.groups['group2'].words).toEqual(['Word 3', 'Word 4']);
    });

    it.skip('detects faulty riddles', () => {
        function faulty() {
            const faulty = { id: '2', wordsPerGroup: 5, groups: { 'g1': { title: 'G1' }, 'g2': { title: 'G2' }, }, words: { 'W1': 'g1', 'W2': 'g2', 'W3': 'g2', } };
            return new Game(faulty);
        }
        expect(faulty).toThrowError();
    });

    it('creates a set of derived stores', () => {
        const game = new Game(testRiddle);
        expect(game.derived).toEqual({
            phase: expect.anything(),
            selectionEmpty: expect.anything(),
            selectionFull: expect.anything(),
            uncoupledWords: expect.anything(),
            coupledGroupIds: expect.anything(),
            mistakesRemaining: expect.anything(),
            percentage: expect.anything(),
        })

    });

});

describe('derived svelte stores', () => {

    it('phase tracks game state', () => {
        const game = new Game(testRiddle);
        const phase = game.derived.phase;
        expect(get(phase)).toBe(GamePhase.playing)
        game.guesses = [{ words: ['Wort 1', 'Wort 2'], group: 'group1' }]
        expect(get(phase)).toBe(GamePhase.last)
        game.guesses = [{ words: ['Wort 1', 'Wort 3'] }]
        game.selection = ['Wort 1', 'Wort 3']
        expect(get(phase)).toBe(GamePhase.mistaken)
    });

    it.todo('selectionEmpty & selectionFull track selection')
    it.todo('uncoupledWords, coupledGroupIds & mistakesRemaining track guesses')
    it.todo('percentage tracks coupledGroupIds')

});
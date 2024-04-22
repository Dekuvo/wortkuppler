import { type Readable, get } from 'svelte/store';

import { Game, GamePhase } from './Game';

const testRiddle = {
    id: '1',
    groups: {
        'groupa': { title: 'Group A' },
        'groupb': { title: 'Group B' },
    },
    words: {
        'Word 1a': 'groupa',
        'Word 2a': 'groupa',
        'Word 1b': 'groupb',
        'Word 2b': 'groupb',
    }
};

// #region Game creation
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
        expect.soft(game.riddle.groups['groupa'].words).toEqual(['Word 1a', 'Word 2a']);
        expect.soft(game.riddle.groups['groupb'].words).toEqual(['Word 1b', 'Word 2b']);
    });

    it('detects faulty/assymetric riddles', () => {
        
        function faulty1() {
            const faulty = { id: '2',groups: {  }, words: { } };
            return new Game(faulty);
        }
        expect(faulty1).toThrowError('no groups');

        function faulty2() {
            const faulty = { id: '2',groups: { 'g1': { title: 'G1' }, 'g2': { title: 'G2' }, }, words: { } };
            return new Game(faulty);
        }
        expect(faulty2).toThrowError('no words');

        function assymetric1() {
            const faulty = { id: '2', groups: { 'g1': { title: 'G1' }, 'g2': { title: 'G2' }, }, words: { 'W1': 'g1', 'W2': 'g2', 'W3': 'g2' } };
            return new Game(faulty);
        }
        expect(assymetric1).toThrowError('assymetric');
        
        function assymetric2() {
            const faulty = { id: '2', groups: { 'g1': { title: 'G1' }, 'g2': { title: 'G2' }, }, words: { 'W1': 'g1', 'W2': 'g2', 'W3': 'g2', 'W4': 'g2', } };
            return new Game(faulty);
        }
        expect(assymetric2).toThrowError('assymetric');
        
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
        });

    });

});
// #endregion

// #region derived svelte stores
describe('derived svelte store', () => {

    it('tracks phase from guesses and selection', () => {
        const game = new Game(testRiddle);
        const phase = game.derived.phase;
        expect(get(phase)).toBe(GamePhase.playing);
        game.guesses = [{ words: ['Word 1a', 'Word 2a'], group: 'groupa' }];
        expect(get(phase)).toBe(GamePhase.last);
        game.guesses = [{ words: ['Word 1a', 'Word 1b'] }];
        game.selection = ['Word 1a', 'Word 1b'];
        expect(get(phase)).toBe(GamePhase.mistaken);
    });

    it('tracks selectionEmpty & selectionFull from selection', () => {
        const game = new Game(testRiddle);
        const empty = game.derived.selectionEmpty;
        const full = game.derived.selectionFull;
        expect(get(empty)).toBeTruthy();
        expect(get(full)).toBeFalsy();
        game.selection = ['Word 1a'];
        expect(get(empty)).toBeFalsy();
        expect(get(full)).toBeFalsy();
        game.selection = ['Word 1a', 'Word 2a'];
        expect(get(empty)).toBeFalsy();
        expect(get(full)).toBeTruthy();
    });

    it('tracks uncoupledWords, coupledGroupIds, mistakesRemaining & percentage from guesses', () => {
        const game = new Game(testRiddle);
        const uncoupledWords = game.derived.uncoupledWords;
        const coupledGroupIds = game.derived.coupledGroupIds;
        const mistakesRemaining = game.derived.mistakesRemaining;
        const percentage = game.derived.percentage;

        expect.soft(get(uncoupledWords)).toEqual(Object.keys(testRiddle.words));
        expect.soft(get(coupledGroupIds)).toEqual([]);
        expect.soft(get(mistakesRemaining)).toBe(2);
        expect.soft(get(percentage)).toBeCloseTo(0);

        game.guesses = [{ words: ['Word 1a', 'Word 2b'] }];
        expect.soft(get(coupledGroupIds)).toEqual([]);
        expect.soft(get(mistakesRemaining)).toBe(1);
        expect.soft(get(percentage)).toBeCloseTo(0);

        game.guesses = [{ words: ['Word 1a', 'Word 2b'] }, { words: ['Word 1a', 'Word 2a'], group: 'groupa' }];
        expect.soft(get(uncoupledWords)).toEqual(['Word 1b', 'Word 2b']);
        expect.soft(get(coupledGroupIds)).toEqual(['groupa']);
        expect.soft(get(mistakesRemaining)).toBe(1);
        expect.soft(get(percentage)).toBeCloseTo(0.5);

        game.guesses = [{ words: ['Word 1a', 'Word 2a'], group: 'groupa' }, { words: ['Word 1b', 'Word 2b'], group: 'groupb' }];
        expect.soft(get(uncoupledWords)).toEqual([]);
        expect.soft(get(coupledGroupIds)).toEqual(['groupa', 'groupb']);
        expect.soft(get(percentage)).toBeCloseTo(1);
    });

});
// #endregion

// #region riddle methods
describe('riddle method', () => {

    it('returns all words as array', () => {
        const game = new Game(testRiddle);
        expect(game.words).toEqual(['Word 1a', 'Word 2a', 'Word 1b', 'Word 2b']);
    });

    it('returns count of all words', () => {
        const game = new Game(testRiddle);
        expect(game.wordCount).toBe(4);
    });

    it('determines uncoupled words', () => {
        const game = new Game(testRiddle);
        expect(game.uncoupledWords).toEqual(['Word 1a', 'Word 2a', 'Word 1b', 'Word 2b']);

        game.guesses = [{ words: ['Word 1a', 'Word 2b'] }];
        expect(game.uncoupledWords).toEqual(['Word 1a', 'Word 2a', 'Word 1b', 'Word 2b']);

        game.guesses = [{ words: ['Word 1a', 'Word 2b'] }, { words: ['Word 1a', 'Word 2a'], group: 'groupa' }];
        expect(game.uncoupledWords).toEqual(['Word 1b', 'Word 2b']);

        game.guesses = [{ words: ['Word 1a', 'Word 2a'], group: 'groupa' }, { words: ['Word 1b', 'Word 2b'], group: 'groupb' }];
        expect(game.uncoupledWords).toEqual([]);

    });

    it('returns ids of all groups', () => {
        const game = new Game(testRiddle);
        expect(game.groupIds).toEqual(['groupa', 'groupb']);
    });

    it('fetches a group by it\'s id', () => {
        const game = new Game(testRiddle);
        const groupa = game.getGroupById('groupa');
        expect(groupa).toBeDefined();
        expect(groupa).toMatchObject({ 'title': 'Group A' });
        expect(game.getGroupById('notThere')).toBeUndefined();
    });


});
// #endregion

// #region game checks
describe('game checks', () => {

    it('checks if selection is maxed', () => {
        const game = new Game(testRiddle);
        expect(game.isSelectionFull()).toBeFalsy();

        game.selection = ['Word 1a'];
        expect(game.isSelectionFull()).toBeFalsy();

        game.selection = ['Word 1a', 'Word 2a'];
        expect(game.isSelectionFull()).toBeTruthy();
    });

    it('compares selection to previous mistakes', () => {
        const game = new Game(testRiddle);
        game.guesses = [{ words: ['Word 1a', 'Word 2b'] }, { words: ['Word 1a', 'Word 2a'], group: 'groupa' }];

        // empty and incomplete are never a mistakes
        expect(game.isSelectionMistake()).toBeFalsy();
        game.selection = ['Word 1a'];
        expect(game.isSelectionMistake()).toBeFalsy();

        // detects previuos mistake, disregarding order
        game.selection = ['Word 1a', 'Word 2b'];
        expect(game.isSelectionMistake()).toBeTruthy();
        game.selection = ['Word 2b', 'Word 1a'];
        expect(game.isSelectionMistake()).toBeTruthy();

        // does not detect previuos correct couple, disregarding order
        game.selection = ['Word 1a', 'Word 2a'];
        expect(game.isSelectionMistake()).toBeFalsy();
        game.selection = ['Word 2a', 'Word 1a'];
        expect(game.isSelectionMistake()).toBeFalsy();
    });

    it('checks if only one couple is remaining', () => {
        const game = new Game(testRiddle);
        expect(game.isLastCouple()).toBeFalsy();

        game.guesses = [{ words: ['Word 1a', 'Word 2a'], group: 'groupa' }];
        expect(game.isLastCouple()).toBeTruthy();

        game.guesses = [{ words: ['Word 1a', 'Word 2a'], group: 'groupa' }, { words: ['Word 1b', 'Word 2b'], group: 'groupb' }];
        expect(game.isLastCouple()).toBeFalsy();
    });

});
// #endregion

// #region game action
describe('game action', () => {

    it('adds word to selection', () => {
        const game = new Game(testRiddle);
        expect(game.selection).toEqual([]);

        expect(game.select('Word 2a')).toBeTruthy();
        expect(game.selection).toEqual(['Word 2a']);

        // ignores duplicates
        expect(game.select('Word 2a')).toBeFalsy();
        expect(game.selection).toEqual(['Word 2a']);

        expect(game.select('Word 1b')).toBeTruthy();
        expect(game.selection).toEqual(['Word 2a', 'Word 1b']);

        // full
        expect(game.select('Word 1a')).toBeFalsy();
        expect(game.selection).toEqual(['Word 2a', 'Word 1b']);
    });


    it('removes word from selection', () => {
        const game = new Game(testRiddle);
        game.selection = ['Word 1a', 'Word 2a'];

        expect(game.deselect('Word 1a')).toBeTruthy();
        expect(game.selection).toEqual(['Word 2a']);

        // ignores if word is not in selection
        expect(game.deselect('Word 1a')).toBeTruthy();
        expect(game.selection).toEqual(['Word 2a']);

        // can't deselect on last group
        game.guesses = [{ words: ['Word 1a', 'Word 2a'], group: 'groupa' }];
        game.selection = ['Word 1b', 'Word 2b'];
        expect(game.deselect('Word 1b')).toBeFalsy();
        expect(game.selection).toEqual(['Word 1b', 'Word 2b']);
    });

    it('clears selection', () => {
        const game = new Game(testRiddle);
        game.selection = ['Word 1a', 'Word 2a'];

        expect(game.clearSelection()).toBeTruthy();
        expect(game.selection).toEqual([]);

        // clearing empty should be possible
        expect(game.clearSelection()).toBeTruthy();
        expect(game.selection).toEqual([]);

        // can't clear last group
        game.guesses = [{ words: ['Word 1a', 'Word 2a'], group: 'groupa' }];
        game.selection = ['Word 1b', 'Word 2b'];
        expect(game.clearSelection()).toBeFalsy();
        expect(game.selection).toEqual(['Word 1b', 'Word 2b']);
    });

    it('couples selection (guess)', () => {
        // const testRiddleExpanded = { ...testRiddle };
        // testRiddleExpanded.groups = Object.assign(testRiddleExpanded.groups, { 'group3': { title: 'Group 3' } });
        // testRiddleExpanded.words = Object.assign(testRiddleExpanded.words, { 'Word 5': 'group3', 'Word 6': 'group3' });

        const game = new Game(testRiddle);

        // only full groups can be coupled
        game.selection = ['Word 1a'];
        expect(game.coupleSelection()).toBeFalsy();
        expect(game.guesses).toHaveLength(0);

        // wrong couple adds a mistake
        game.selection = ['Word 1a', 'Word 1b'];
        expect(game.coupleSelection()).toBeFalsy();
        expect(game.guesses).toHaveLength(1);
        const guess0 = game.guesses[0];
        expect(guess0).toHaveProperty('words');
        expect(guess0.words).toEqual(game.selection);
        expect(guess0).not.toHaveProperty('group');

        // correct couple adds guess
        game.selection = ['Word 1a', 'Word 2a'];
        expect(game.coupleSelection()).toBeTruthy();
        expect(game.guesses).toHaveLength(2);
        const guess1 = game.guesses[1];
        expect(guess1).toHaveProperty('words');
        expect(guess1.words).toEqual(['Word 1a', 'Word 2a']);
        expect(guess1).toHaveProperty('group');
        expect(guess1.group).toBe('groupa');

        // last group remaining is selected automatically
        expect(game.selection).toEqual(['Word 1b', 'Word 2b']);

        // any correct couple (except second to last) clears selection
        expect(game.coupleSelection()).toBeTruthy();
        expect(game.selection).toHaveLength(0);
    });


});
// #endregion

// #region helper function
describe('helper function', () => {

    it('counts remaining mistakes until loss', () => {
        const game = new Game(testRiddle);
        expect(game.getMistakesRemaining()).toBe(2);

        // mistaken
        game.guesses = [{ words: ['Word 1a', 'Word 1b'] }];
        expect(game.getMistakesRemaining()).toBe(1);

        // lost
        game.guesses = [{ words: ['Word 1a', 'Word 1b'] }, { words: ['Word 2a', 'Word 2b'] }];
        expect(game.getMistakesRemaining()).toBe(0);

        // riddle sets mistakes Allowed
        const mistakes10Riddle = { ...testRiddle, mistakesAllowed: 10 };
        const game10Mistakes = new Game(mistakes10Riddle);
        expect(game10Mistakes.getMistakesRemaining()).toBe(10);
        game10Mistakes.guesses = [{ words: ['Word 1a', 'Word 1b'] }, { words: ['Word 2a', 'Word 2b'] }];
        expect(game10Mistakes.getMistakesRemaining()).toBe(8);
        expect(game10Mistakes.getPhase()).not.toBe(GamePhase.lost);
    });

    it('calculates the max count of words in selection, that belong to same group', () => {
        const testRiddle3x3 = {
            id: '1',
            groups: {
                'groupa': { title: 'Group A' },
                'groupb': { title: 'Group B' },
                'groupc': { title: 'Group C' },
            },
            words: {
                'Word 1a': 'groupa',
                'Word 2a': 'groupa',
                'Word 3a': 'groupa',
                'Word 1b': 'groupb',
                'Word 2b': 'groupb',
                'Word 3b': 'groupb',
                'Word 1c': 'groupc',
                'Word 2c': 'groupc',
                'Word 3c': 'groupc',
            }
        };
        const game = new Game(testRiddle3x3);
        expect(game.getMaxCorrelation()).toBe(0);

        game.selection = ['Word 1a'];
        expect(game.getMaxCorrelation()).toBe(1);

        game.selection = ['Word 1a', 'Word 1b'];
        expect(game.getMaxCorrelation()).toBe(1);

        game.selection = ['Word 3c', 'Word 3b'];
        expect(game.getMaxCorrelation()).toBe(1);

        game.selection = ['Word 1a', 'Word 2a'];
        expect(game.getMaxCorrelation()).toBe(2);

        game.selection = ['Word 2a', 'Word 3b', 'Word 1a'];
        expect(game.getMaxCorrelation()).toBe(2);

        game.selection = ['Word 1c', 'Word 2a', 'Word 3b'];
        expect(game.getMaxCorrelation()).toBe(1);

        game.selection = ['Word 3c', 'Word 2a', 'Word 1c'];
        expect(game.getMaxCorrelation()).toBe(2);

        game.selection = ['Word 1c', 'Word 2c', 'Word 3c'];
        expect(game.getMaxCorrelation()).toBe(3);

        game.selection = ['Word 3c', 'Word 2c', 'Word 1c'];
        expect(game.getMaxCorrelation()).toBe(3);

    });

    it('derives game phase from state', () => {
        const game = new Game(testRiddle);
        expect(game.getPhase()).toBe(GamePhase.playing);

        // lost
        game.guesses = [{ words: ['Word 1a', 'Word 1b'] }, { words: ['Word 2a', 'Word 2b'] }];
        expect(game.getMistakesRemaining()).toBeLessThanOrEqual(0);
        expect(game.getPhase()).toBe(GamePhase.lost);

        // won
        game.guesses = [{ words: ['Word 1a', 'Word 2a'], group: 'groupa' }, { words: ['Word 1b', 'Word 2b'], group: 'groupb' }];
        expect(game.getMistakesRemaining()).toBeGreaterThan(0);
        expect(game.getPhase()).toBe(GamePhase.won);

        // last
        game.guesses = [{ words: ['Word 1a', 'Word 2a'], group: 'groupa' }];
        expect(game.isLastCouple()).toBeTruthy();
        expect(game.getPhase()).toBe(GamePhase.last);

        // mistaken
        game.guesses = [{ words: ['Word 1a', 'Word 1b'] }];
        game.selection = ['Word 1a', 'Word 1b'];
        expect(game.getPhase()).toBe(GamePhase.mistaken);

        // playing
        game.selection = ['Word 1a'];
        expect(game.getPhase()).toBe(GamePhase.playing);

    });

});
// #endregion

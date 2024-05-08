import { render, screen, cleanup, act } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Word from './Word.svelte';
import { WordState } from '$lib/models/Word';

describe('normal Word', () => {
    
    it("creates a button with specified text", () => {
        render(Word,{word:'Testword'});
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toContainElement(screen.getByText('Testword'));
    });
    
    it("is enabled", () => {
        render(Word,{word:'Test'});
        expect(screen.getByRole('button')).toBeEnabled();
    });

    it("is disabled, if not selectable", async () => {
        const {component} = render(Word,{word:'Test'});
        expect(screen.getByRole('button')).toBeEnabled();
        await component.$set({ selectable: false });
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it("fires 'select' event on:click", async  () => {
        const user = userEvent.setup();
        const {component} = render(Word,{word:'Test'});;
        const onSelect = vi.fn();
        component.$on('select', onSelect);
        await user.click(screen.getByRole('button'));
        expect(onSelect).toHaveBeenCalledOnce();
    });


});

describe('selected Word', () => {
    
    it("fires 'deselect' event on:click", async  () => {
        const user = userEvent.setup();
        const {component} = render(Word,{word:'Test',state:WordState.selected});
        const onDeselect = vi.fn();
        component.$on('deselect', onDeselect);
        await user.click(screen.getByRole('button'));
        expect(onDeselect).toHaveBeenCalledOnce();
    });

    it("switches to normal after click", async  () => {
        const user = userEvent.setup();
        const {component} = render(Word,{word:'Test',state:WordState.selected,selectable: false});
        expect(screen.getByRole('button')).toBeEnabled();
        await user.click(screen.getByRole('button'));
        expect(screen.getByRole('button')).toBeDisabled();
    });

});

describe('selection Word', () => {
    
    it("fires 'deselect' event on:click", async  () => {
        const user = userEvent.setup();
        const {component} = render(Word,{word:'Test',state:WordState.selection});
        const onDeselect = vi.fn();
        component.$on('deselect', onDeselect);
        await user.click(screen.getByRole('button'));
        expect(onDeselect).toHaveBeenCalledOnce();
    });

});

describe('lastGroup Word', () => {
    
    it("can't be clicked", async  () => {
        render(Word,{word:'Test',state: WordState.lastGroup});
        expect(screen.getByRole('button')).toBeDisabled();
    });

});

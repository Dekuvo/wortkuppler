import { render, screen, cleanup, act } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import GuessButton from './GuessButton.svelte';

describe('default GuessButton', () => {
    
    it("should create a button saying 'Action'", () => {
        render(GuessButton);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toContainElement(screen.getByText('Action'));
    });
    it("should not have an icon", () => {
        render(GuessButton);
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
    it("should be enabled", () => {
        render(GuessButton);
        expect(screen.getByRole('button')).toBeEnabled();

    });


});

describe('GuessButton', () => {
    
    it("can be disabled by props", async() => {
        const {component} = render(GuessButton,{disabled: true});
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        await component.$set({ disabled: false });
        expect(button).toBeEnabled();
    });

    it("fires on:click", async  () => {
        const user = userEvent.setup();
        const {component} = render(GuessButton);
        const onClick = vi.fn();
        component.$on('click', onClick);
        await user.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledOnce();
    });


});

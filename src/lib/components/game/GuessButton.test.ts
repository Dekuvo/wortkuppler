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

// it('set and update prop', async () => {
//   // Pass your prop to the render function
//   const { component } = render(GuessButton, { answer: 'I dunno' });

//   expect(screen.queryByText('The answer is I dunno')).toBeInTheDocument();

//   // Update prop using Svelte's Client-side component API
//   await component.$set({ answer: 'another mystery' });
//   expect(screen.queryByText('The answer is another mystery')).toBeInTheDocument();
// });
// NOTE: jest-dom adds handy assertions to Jest and it is recommended, but not required.
import '@testing-library/jest-dom'

import { render, fireEvent, screen } from '@testing-library/svelte'

import App from './App.svelte';
import { onMount, tick} from "svelte";


test('shows proper heading when rendered', () => {
    render(App)
    const heading = screen.getByText('One AWS to go, Please!')
    expect(heading).toBeInTheDocument()
})

describe.skip('login tests', () =>{
    async function pressLogin(){
        const loginButton = screen.getByRole('button')
        await fireEvent.click(loginButton)
    }

    // Note: This is as an async test as we are using `fireEvent`
    test('valid username changes the view to the main view', async () => {

        render(App)

        // Apply username info to the input.
        const usernameInput = screen.getByPlaceholderText("Username");
        await fireEvent.input(usernameInput, {target: {value: 'Test'}});
        expect(usernameInput.value).toBe('Test')

        await pressLogin();
        
        // Using await when firing events is unique to the svelte testing library because
        // we have to wait for the next `tick` so that Svelte flushes all pending state changes.
        const startButton = screen.getByRole('button')
        expect(startButton).toHaveTextContent('Start new environment')

    })

    test('invalid authentication displays error message', async () => {
        render(App)

        // Apply username info to the input. In valid username.
        const usernameInput = screen.getByPlaceholderText("Username");
        await fireEvent.input(usernameInput, {target: {value: 'Not user'}});
        expect(usernameInput.value).toBe('Not user')

        await pressLogin()

        const errorMessage = screen.getByText("Unauthorized")
        expect(errorMessage).toHaveValue("Unauthorized")
    })
})
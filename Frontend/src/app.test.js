// NOTE: jest-dom adds handy assertions to Jest and it is recommended, but not required.
import '@testing-library/jest-dom'

import { render, fireEvent, screen } from '@testing-library/svelte'

import App from './App.svelte';

test('shows proper heading when rendered', () => {
    render(App)
    const heading = screen.getByText('One AWS to go, Please!')
    expect(heading).toBeInTheDocument()
})

// Note: This is as an async test as we are using `fireEvent`
test('pressing login button switches to view with start env button', async () => {
    render(App)
    const loginButton = screen.getByRole('button')
    expect(loginButton).toHaveTextContent('Login')
    // Using await when firing events is unique to the svelte testing library because
    // we have to wait for the next `tick` so that Svelte flushes all pending state changes.
    await fireEvent.click(loginButton)

    const startEnvButton = screen.getByRole('button')
    expect(startEnvButton).toHaveTextContent('Start new environment')
})
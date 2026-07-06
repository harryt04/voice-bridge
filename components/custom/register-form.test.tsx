import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from './register-form'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSignUpEmail = vi.fn()

vi.mock('@/lib/auth-client', () => ({
  signUp: {
    email: (...args: any[]) => mockSignUpEmail(...args),
  },
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockSignUpEmail.mockReset().mockResolvedValue(undefined)
  })

  it('renders the registration form', () => {
    render(<RegisterForm />)

    expect(screen.getByText('VoiceBridge')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument()
  })

  it('shows an error when submitting with empty fields', async () => {
    const { container } = render(<RegisterForm />)

    fireEvent.submit(container.querySelector('form')!)

    expect(
      await screen.findByText('Please fill in all fields'),
    ).toBeInTheDocument()
    expect(mockSignUpEmail).not.toHaveBeenCalled()
  })

  it('signs up and redirects to /places on success', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByPlaceholderText('Full name'), 'Jane Doe')
    await user.type(screen.getByPlaceholderText('Email'), 'jane@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() =>
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      }),
    )
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/places'))
  })

  it('shows an error message when signUp.email throws', async () => {
    mockSignUpEmail.mockRejectedValue(new Error('Email already in use'))
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByPlaceholderText('Full name'), 'Jane Doe')
    await user.type(screen.getByPlaceholderText('Email'), 'jane@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText('Email already in use')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})

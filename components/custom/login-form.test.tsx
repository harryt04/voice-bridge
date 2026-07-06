import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './login-form'

const mockPush = vi.fn()
const mockGetSearchParam = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGetSearchParam }),
}))

const mockSignInSocial = vi.fn()
const mockSignInEmail = vi.fn()

vi.mock('@/lib/auth-client', () => ({
  signIn: {
    social: (...args: any[]) => mockSignInSocial(...args),
    email: (...args: any[]) => mockSignInEmail(...args),
  },
}))

describe('LoginForm', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockGetSearchParam.mockReset().mockReturnValue(null)
    mockSignInSocial.mockReset().mockResolvedValue(undefined)
    mockSignInEmail.mockReset().mockResolvedValue({ error: null })
  })

  it('renders the sign-in form', () => {
    render(<LoginForm />)

    expect(screen.getByText('VoiceBridge')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /sign in$/i }),
    ).toBeInTheDocument()
  })

  it('shows an error when submitting with empty fields', async () => {
    const { container } = render(<LoginForm />)

    fireEvent.submit(container.querySelector('form')!)

    expect(
      await screen.findByText('Please enter both email and password'),
    ).toBeInTheDocument()
    expect(mockSignInEmail).not.toHaveBeenCalled()
  })

  it('redirects to /places by default after a successful sign-in', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in$/i }))

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/places'))
  })

  it('redirects to an internal ?redirect= path after sign-in', async () => {
    mockGetSearchParam.mockImplementation((key: string) =>
      key === 'redirect' ? '/vocabulary' : null,
    )
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in$/i }))

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/vocabulary'))
  })

  it('ignores an external ?redirect= URL and falls back to /places', async () => {
    mockGetSearchParam.mockImplementation((key: string) =>
      key === 'redirect' ? 'https://evil.example.com' : null,
    )
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in$/i }))

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/places'))
  })

  it('shows an error returned by signIn.email', async () => {
    mockSignInEmail.mockResolvedValue({
      error: { message: 'Invalid credentials' },
    })
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in$/i }))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('uses the validated redirect path as the Google sign-in callback URL', async () => {
    mockGetSearchParam.mockImplementation((key: string) =>
      key === 'redirect' ? '/vocabulary' : null,
    )
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(
      screen.getByRole('button', { name: /continue with google/i }),
    )

    await waitFor(() =>
      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/vocabulary',
      }),
    )
  })
})

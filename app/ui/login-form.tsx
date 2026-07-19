'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authenticate } from '@/app/lib/actions';

export default function LoginForm() {
  const searchParams = useSearchParams();
  // Where to send the user after a successful login - defaults to home
  // if they landed on /login directly rather than being redirected here
  // by proxy.ts's route protection.
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // authenticate() (app/lib/actions.ts) calls signIn('credentials', formData)
  // and returns an error string on failure, or nothing on success (in which
  // case signIn has already redirected). useActionState wires that return
  // value up as `errorMessage` and tracks submit-in-flight as `isPending`.
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className="mb-3 text-xl font-semibold text-gray-900">
          Please log in to continue.
        </h1>
        <div className="w-full">
          <label
            htmlFor="username"
            className="mb-1 block text-sm font-medium text-gray-900"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Enter your username"
            required
            className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm text-gray-900 outline-2 placeholder:text-gray-500"
          />
        </div>
        <div className="mt-4 w-full">
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-900"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            required
            minLength={6}
            className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm text-gray-900 outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Read by signIn() itself (not passed into authorize's credentials) to
            know where to send the user after a successful login. */}
        <input type="hidden" name="redirectTo" value={callbackUrl} />

        <button
          type="submit"
          disabled={isPending}
          className="mt-4 w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Log in
        </button>

        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      </div>
    </form>
  );
}

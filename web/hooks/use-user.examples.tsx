// Example usage of the useUser hook
// You can use this hook in any component within the UserProvider

import { useUser } from "@/hooks/use-user";

export function ExampleUserComponent() {
  const { user, isLoading, isError, error, login, logout } = useUser();

  if (isLoading) {
    return <div>Loading user...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  if (!user) {
    return (
      <div>
        <button
          onClick={() => login({ email: "test@example.com", password: "password123" })}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

// More examples:

// 1. Using in a form component
export function LoginForm() {
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await login({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}

// 2. Protected component that requires authentication
export function ProtectedContent() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Please login to view this content</div>;

  return <div>Protected content for {user.name}</div>;
}

// 3. Registration example
export function RegisterForm() {
  const { register } = useUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await register({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" required />
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Register</button>
    </form>
  );
}

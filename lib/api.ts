// Base URL of your backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Something went wrong");
  }

  return res.json();
}

export const loginUser = async (email: string, password: string) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const signupUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: "startup" | "investor";
}) => {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getMe = async (token: string) => {
  return request("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

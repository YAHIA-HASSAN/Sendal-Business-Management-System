export type ApiUser = {
  id: string;
  name: string;
  username: string;
  role: "seller" | "admin";
};

export type LoginResponse = {
  token: string;
  user: ApiUser;
};

export async function mockLogin(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json() as LoginResponse | { message?: string };
  if (!response.ok) {
    throw new Error("message" in data ? data.message ?? "تعذر تسجيل الدخول." : "تعذر تسجيل الدخول.");
  }
  return data as LoginResponse;
}

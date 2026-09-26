import LoginClient from "./LoginClient";

export const metadata = { title: "Login - Hunter" };

export default function LoginPage() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
  return <LoginClient clientId={clientId} />;
}

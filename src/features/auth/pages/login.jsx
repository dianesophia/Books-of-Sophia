import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import PasswordInput from "../../../components/auth/PasswordInput";
import LoginImage from "../../../assets/background/loginBG.png";
import { Card } from "../../../components/ui/card";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 lg:justify-end lg:pr-16 xl:pr-28"
      style={{ backgroundImage: `url(${LoginImage})` }}
    >
      <Card className="w-full max-w-md rounded-2xl border border-[#e9dfd1] bg-[#fbf6ec]/95 p-8 shadow-[0_20px_60px_rgba(60,45,30,0.25)] backdrop-blur-sm sm:p-10">
        <div className="text-center">
          <BookOpen className="mx-auto mb-4 text-[#5f6f50]" size={44} />

          <h1 className="font-serif text-4xl text-[#3f372f] sm:text-5xl">
            Books of Sophia
          </h1>

          <p className="mt-3 font-serif text-sm text-[#6f6458]">
            Every book holds a little piece of me.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            aria-label="Email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-[#e5d9c8] bg-[#fffdf9] px-4 py-3 text-sm text-[#51483f] outline-none transition placeholder:text-[#8a7f72] focus:border-[#899878] focus:ring-2 focus:ring-[#899878]/20"
          />

          <PasswordInput
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-[#6f6458]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="accent-[#7c8b69]"
              />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="text-[#5f6f50] underline underline-offset-2 hover:text-[#4a5a3d]"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#6b7d58] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#5b6c4a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Opening your library..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6f6458]">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-[#5f6f50] underline underline-offset-2 hover:text-[#4a5a3d]"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </main>
  );
}
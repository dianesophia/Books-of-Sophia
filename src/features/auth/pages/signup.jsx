// import SignupImage from "@/assets/background/signupBG.png";

// function signup() {
//   return (
//      <div
//        className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
//        style={{ backgroundImage: `url(${SignupImage})` }}
//      >
//        {/* Your login form goes here */}
//      </div>
//    );
// }

// export default signup



import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import PasswordInput from "../../../components/auth/PasswordInput";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(event) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: name.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        window.location.replace("/");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f3eb] px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e5e8d9] text-[#657654]">
            <BookOpen size={27} />
          </div>

          <h1 className="font-serif text-4xl text-[#51483f]">
            Books of Sophia
          </h1>

          <p className="mt-3 text-sm text-[#887b6e]">
            Your own little corner of the reading world.
          </p>
        </div>

        <div className="rounded-3xl border border-[#e9dfd1] bg-[#fffdf9] p-7 shadow-[0_15px_50px_rgba(92,75,53,0.07)] sm:p-9">
          <h2 className="font-serif text-2xl text-[#51483f]">
            Join the library
          </h2>

          <p className="mt-2 text-sm text-[#887b6e]">
            Start collecting stories and creating memories.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success ? (
            <div className="mt-6 rounded-2xl bg-[#eef1e6] p-5 text-center">
              <BookOpen className="mx-auto mb-3 text-[#71815f]" size={28} />

              <h3 className="font-serif text-xl text-[#51483f]">
                One more little step
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#75695e]">
                Your account has been submitted. If email confirmation is
                enabled, check your inbox for a verification link before
                signing in.
              </p>

              <Link
                to="/login"
                className="mt-5 inline-block font-semibold text-[#71815f] hover:underline"
              >
                Go to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="mt-7 space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#62574c]"
                >
                  Your name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="What should we call you?"
                  autoComplete="name"
                  maxLength={80}
                  required
                  className="w-full rounded-xl border border-[#e5d9c8] bg-[#fffdf9] px-4 py-3 text-sm outline-none placeholder:text-[#b5a99a] focus:border-[#899878] focus:ring-2 focus:ring-[#899878]/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#62574c]"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-[#e5d9c8] bg-[#fffdf9] px-4 py-3 text-sm outline-none placeholder:text-[#b5a99a] focus:border-[#899878] focus:ring-2 focus:ring-[#899878]/20"
                />
              </div>

              <PasswordInput
                id="password"
                label="Password (at least 8 characters)"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />

              <PasswordInput
                id="confirm-password"
                label="Confirm password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#7c8b69] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#687957] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Preparing your library..." : "Create my account"}
              </button>
            </form>
          )}

          <p className="mt-7 text-center text-sm text-[#887b6e]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#71815f] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

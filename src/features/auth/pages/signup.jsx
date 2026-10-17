import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import PasswordInput from "../../../components/auth/PasswordInput";
import SignupImage from "../../../assets/background/signupBG.jpg";
import Book from "../../../assets/badge/book.png";
import { Card } from "../../../components/ui/Card";

// Tiny grain texture, drawn by the browser (no image file needed)
const grain = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.25  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

function PaperBackground() {
  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="paper-edge" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="26"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ filter: "url(#paper-edge)" }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-[#faf3e6] shadow-[0_20px_50px_rgba(60,45,30,0.3),inset_0_0_40px_rgba(170,140,95,0.18)]">
          <div
            className="absolute inset-0 opacity-40 mix-blend-multiply"
            style={{ backgroundImage: grain }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(150,115,70,0.15)_100%)]" />
        </div>
      </div>
    </>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#e3d6c2] bg-[#fffaf0] px-4 py-3 text-sm text-[#51483f] shadow-[inset_0_1px_3px_rgba(120,95,60,0.12)] outline-none transition placeholder:text-[#8a7f72] focus:border-[#899878] focus:ring-2 focus:ring-[#899878]/20";

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
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 lg:justify-end lg:pr-28 xl:pr-52 2xl:pr-72"
      style={{ backgroundImage: `url(${SignupImage})` }}
    >
      <Card className="relative isolate flex min-h-[640px] w-full max-w-xl flex-col justify-center border-0 bg-transparent p-10 shadow-none sm:min-h-[720px] sm:p-16">
        <PaperBackground />

        <div className="text-center">
          <img src={Book} alt="Book" className="mx-auto mb-1 h-16 w-auto" />

          <h1 className="font-serif text-4xl text-[#3f372f] sm:text-5xl">
            Books of Sophia
          </h1>

          <p className="mt-3 font-serif text-sm text-[#6f6458]">
            Your own little corner of the reading world.
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

        {success ? (
          <div className="mt-8 rounded-2xl border border-[#e3d6c2] bg-[#fffaf0]/70 p-6 text-center">
            <h3 className="font-serif text-xl text-[#3f372f]">
              One more little step
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#6f6458]">
              Your account has been submitted. If email confirmation is
              enabled, check your inbox for a verification link before signing
              in.
            </p>

            <Link
              to="/login"
              className="mt-5 inline-block text-[#5f6f50] underline underline-offset-2 hover:text-[#4a5a3d]"
            >
              Go to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="mt-8 space-y-4">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="What should we call you?"
              aria-label="Your name"
              autoComplete="name"
              maxLength={80}
              required
              className={inputClass}
            />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              aria-label="Email"
              autoComplete="email"
              required
              className={inputClass}
            />

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
              className="w-full rounded-xl bg-[#6b7d58] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(60,75,45,0.3)] transition hover:bg-[#5b6c4a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Preparing your library..." : "Create my account"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#6f6458]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#5f6f50] underline underline-offset-2 hover:text-[#4a5a3d]"
          >
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}
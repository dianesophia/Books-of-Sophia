import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import ForgotPassword from "../../../assets/background/forgotpassBG.png";
import Book from "../../../assets/badge/book.png";
import { Card } from "../../../components/ui/card";

const grain = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.25  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

function PaperBackground() {
  return (
    <>
      {/* Defines the "rough edge" effect. Hidden, only used by the layer below */}
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
          {/* Grain */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-multiply"
            style={{ backgroundImage: grain }}
          />
          {/* Slightly darker, worn corners */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(150,115,70,0.15)_100%)]" />
        </div>
      </div>
    </>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` },
      );

      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(err.message || "Unable to send a reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 lg:justify-end lg:pr-28 xl:pr-52 2xl:pr-72"
      style={{ backgroundImage: `url(${ForgotPassword})` }}
    >
      <Card className="relative isolate flex min-h-[520px] w-full max-w-xl flex-col justify-center border-0 bg-transparent p-10 shadow-none sm:min-h-[580px] sm:p-16">
        <PaperBackground />

        <div className="text-center">
          <img src={Book} alt="" className="mx-auto mb-1 h-16 w-auto" />

          <h1 className="font-serif text-3xl text-[#3f372f] sm:text-4xl">
            Forgot your password?
          </h1>

          <p className="mt-3 font-serif text-sm leading-6 text-[#6f6458]">
            Enter the email address for your account and we’ll send you a link
            to reset your password.
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

        {sent ? (
          <p
            role="status"
            className="mt-8 rounded-xl border border-[#d5dcc4] bg-[#e9eddf]/80 p-4 text-center text-sm leading-6 text-[#526044]"
          >
            If an account exists for that email, a password-reset link is on
            its way. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              aria-label="Email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-[#e3d6c2] bg-[#fffaf0] px-4 py-3 text-sm text-[#51483f] shadow-[inset_0_1px_3px_rgba(120,95,60,0.12)] outline-none transition placeholder:text-[#8a7f72] focus:border-[#899878] focus:ring-2 focus:ring-[#899878]/20"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#6b7d58] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(60,75,45,0.3)] transition hover:bg-[#5b6c4a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending reset link..." : "Send reset link"}
            </button>
          </form>
        )}

        <Link
          to="/login"
          className="mt-6 text-center text-sm text-[#5f6f50] underline underline-offset-2 hover:text-[#4a5a3d]"
        >
          Back to log in
        </Link>
      </Card>
    </main>
  );
}
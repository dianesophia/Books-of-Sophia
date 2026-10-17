import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import PasswordInput from "../../../components/auth/PasswordInput";
import ResetPassword from "../../../assets/background/resetpassBG.png";
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

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
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;
      setUpdated(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to reset your password. Request a new reset link and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 lg:justify-end lg:pr-28 xl:pr-52 2xl:pr-72"
      style={{ backgroundImage: `url(${ResetPassword})` }}
    >
      <Card className="relative isolate flex min-h-[560px] w-full max-w-xl flex-col justify-center border-0 bg-transparent p-10 shadow-none sm:min-h-[620px] sm:p-16">
        <PaperBackground />

        <div className="text-center">
          <img src={Book} alt="" className="mx-auto mb-1 h-16 w-auto" />

          <h1 className="font-serif text-3xl text-[#3f372f] sm:text-4xl">
            {updated ? "Password updated" : "Choose a new password"}
          </h1>

          <p className="mt-3 font-serif text-sm leading-6 text-[#6f6458]">
            {updated
              ? "Your password has been changed. You can now log in with your new password."
              : "Create a new password for your Books of Sophia account."}
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

        {updated ? (
          <Link
            to="/login"
            className="mt-8 rounded-xl bg-[#6b7d58] px-4 py-3.5 text-center text-sm font-semibold text-white shadow-[0_2px_6px_rgba(60,75,45,0.3)] transition hover:bg-[#5b6c4a]"
          >
            Back to log in
          </Link>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <PasswordInput
              id="new-password"
              label="New password (at least 8 characters)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />

            <PasswordInput
              id="confirm-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#6b7d58] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(60,75,45,0.3)] transition hover:bg-[#5b6c4a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating password..." : "Update password"}
            </button>
          </form>
        )}
      </Card>
    </main>
  );
}
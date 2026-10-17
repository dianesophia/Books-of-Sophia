import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
//import { BookOpen } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import PasswordInput from "../../../components/auth/PasswordInput";
import LoginImage from "../../../assets/background/loginBG.jpg";
import { Card } from "../../../components/ui/Card";
import Book from "../../../assets/badge/book.png";

// Tiny grain texture, drawn by the browser (no image file needed)
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
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 lg:justify-end lg:pr-28 xl:pr-52 2xl:pr-72"
      style={{ backgroundImage: `url(${LoginImage})` }}
    >
      <Card className="relative isolate flex min-h-[640px] w-full max-w-xl flex-col justify-center border-0 bg-transparent p-10 shadow-none sm:min-h-[720px] sm:p-16 lg:ml-80">
        <PaperBackground />

        <div className="text-center">
          {/* <BookOpen className="mx-auto mb-4 text-[#5f6f50]" size={44} /> */}
           <img src={Book} alt="Book" className="mx-auto mb-1 h-16 w-auto" />
          <h1 className="font-serif text-4xl text-[#3f372f] sm:text-5xl pt-7">
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
            className="w-full rounded-xl border border-[#e3d6c2] bg-[#fffaf0] px-4 py-3 text-sm text-[#51483f] shadow-[inset_0_1px_3px_rgba(120,95,60,0.12)] outline-none transition placeholder:text-[#8a7f72] focus:border-[#899878] focus:ring-2 focus:ring-[#899878]/20"
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
            className="w-full rounded-xl bg-[#6b7d58] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(60,75,45,0.3)] transition hover:bg-[#5b6c4a] disabled:cursor-not-allowed disabled:opacity-60"
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
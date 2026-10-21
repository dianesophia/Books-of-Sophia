import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Desk from "@/assets/background/cozy_desk.jpg"

/* ---------- Placeholder numbers ---------- */
// Level and XP now come from Supabase. These three still need their own tables
// (books read, reading streak, badges), so they stay fixed for now.
const STATS = { booksRead: 12, dayStreak: 5, badges: 8 }

// Home screen shortcuts on the desk. Change the paths to match your routes.
const SHORTCUTS = [
  {
    label: 'My Library',
    path: '/library',
    icon: <path d="M4 5 q5 -2 8 1 q3 -3 8 -1 v13 q-5 -2 -8 1 q-3 -3 -8 -1 z M12 6 v13" />,
  },
  {
    label: 'Journal',
    path: '/journal',
    icon: <><rect x="6" y="3" width="13" height="18" rx="2" /><path d="M10 3 v7 l2 -1.5 l2 1.5 v-7" /></>,
  },
  {
    label: 'Garden',
    path: '/garden',
    icon: <><circle cx="12" cy="9" r="3" /><path d="M12 6 q-4 -3 -5 1 q1 3 5 2 M12 6 q4 -3 5 1 q-1 3 -5 2 M12 12 v9 M12 17 q-4 0 -5 -3 M12 17 q4 0 5 -3" /></>,
  },
  {
    label: 'Games',
    path: '/games',
    icon: <><rect x="3" y="8" width="18" height="10" rx="5" /><path d="M8 11 v4 M6 13 h4" /><circle cx="15" cy="12" r="0.8" /><circle cx="17.5" cy="14" r="0.8" /></>,
  },
  {
    label: 'Achievements',
    path: '/achievements',
    icon: <><circle cx="12" cy="9" r="5" /><path d="M9 13.5 l-2 7 l5 -3 l5 3 l-2 -7" /></>,
  },
]

/* ---------- Small pieces ---------- */

function Avatar({ name, src }) {
  if (src) {
    return <img src={src} alt={name} className="h-16 w-16 rounded-full border-2 border-[#d9b867] object-cover" />
  }
  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#d9b867] bg-[#e8cfa6] text-2xl text-[#6b4a2f]"
      aria-label={`${name}'s avatar`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="flex-1 border-l border-[#e3d8bf] px-2 py-3 text-center first:border-l-0">
      <div className="text-2xl leading-tight">{value}</div>
      <div className="text-xs text-[#6f6556]">{label}</div>
    </div>
  )
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-xs text-[#6f6556]">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

const valueBox = 'block w-full truncate rounded-lg border border-[#e3d8bf] bg-[#f7f0df] px-3 py-1.5 text-sm'
const inputBox =
  'block w-full rounded-lg border border-[#b9c79a] bg-white px-3 py-1.5 text-sm outline-none focus:ring-4 focus:ring-[#b9c79a]/60'

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="text-sm">
      {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
    </span>
  )
}

/* ---------- Page ---------- */

function formatJoined(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Profile() {
  const navigate = useNavigate()

  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'signedout' | 'error'
  const [userId, setUserId] = useState(null)
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState(null) // { name, avatar_url, level, level_title, xp, xp_needed, created_at }

  const [draftName, setDraftName] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [infoOpen, setInfoOpen] = useState(true)

  // Load the signed-in player's profile (this is where the XP comes from)
  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: auth } = await supabase.auth.getUser()
      const user = auth?.user
      if (!user) {
        if (!cancelled) setStatus('signedout')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('name, avatar_url, level, level_title, xp, xp_needed, created_at')
        .eq('id', user.id)
        .single()

      if (cancelled) return
      if (error) {
        console.error('Could not load profile:', error.message)
        setStatus('error')
        return
      }

      setUserId(user.id)
      setEmail(user.email || '')
      setProfile(data)
      setStatus('ready')
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const startEdit = () => {
    setDraftName(profile.name)
    setSaveError('')
    setInfoOpen(true)
    setEditing(true)
  }

  const saveEdit = async () => {
    const name = draftName.trim()
    if (!name) {
      setSaveError('Please enter a name.')
      return
    }

    setSaving(true)
    setSaveError('')
    const { error } = await supabase.from('profiles').update({ name }).eq('id', userId)
    setSaving(false)

    if (error) {
      setSaveError(error.message)
      return
    }
    setProfile((p) => ({ ...p, name }))
    setEditing(false)
  }

  if (status === 'loading') {
    return (
      <section className="flex min-h-screen w-full items-center justify-center bg-[#faf3e6] font-serif text-[#6f6556]">
        Loading your profile...
      </section>
    )
  }

  if (status === 'signedout') {
    return (
      <section className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-[#faf3e6] px-6 text-center font-serif text-[#2f2a22]">
        <p>Please sign in to see your profile.</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="rounded-lg bg-[#6b7d48] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#586a3a]"
        >
          Sign in
        </button>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="flex min-h-screen w-full items-center justify-center bg-[#faf3e6] px-6 text-center font-serif text-[#9a5a50]">
        We couldn&apos;t load your profile. Please try again.
      </section>
    )
  }

  const xpPercent = Math.min(100, Math.round((profile.xp / profile.xp_needed) * 100))

  return (
    <section className="grid min-h-screen w-full gap-6 bg-[#faf3e6] px-6 py-8 font-serif text-[#2f2a22] md:px-12 md:py-12 lg:grid-cols-[minmax(320px,420px)_1fr]">
      {/* ---------- My Profile card ---------- */}
      <div className="flex h-fit flex-col rounded-2xl border border-[#e3d8bf] bg-[#fbf6ea] p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-normal">My Profile</h1>

        <div className="mb-5 flex items-center gap-4">
          <Avatar name={profile.name} src={profile.avatar_url} />
          <div>
            <div className="text-lg font-semibold">{profile.name}</div>
            <div className="text-xs text-[#6f6556]">
              Level {profile.level} - {profile.level_title}
            </div>
          </div>
        </div>

        <div
          className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-[#e3d8bf]"
          role="progressbar"
          aria-valuenow={profile.xp}
          aria-valuemin={0}
          aria-valuemax={profile.xp_needed}
          aria-label="Experience points"
        >
          <div className="h-full rounded-full bg-[#6b8a7a] transition-all" style={{ width: `${xpPercent}%` }} />
        </div>
        <div className="mb-5 flex justify-between text-[0.7rem] text-[#6f6556]">
          <span>{profile.xp} / {profile.xp_needed} XP</span>
          <span>{profile.xp_needed - profile.xp} XP to next level</span>
        </div>

        <div className="mb-5 flex rounded-xl border border-[#e3d8bf] bg-[#fdf9ef]">
          <Stat value={STATS.booksRead} label="Books Read" />
          <Stat value={STATS.dayStreak} label="Day Streak" />
          <Stat value={STATS.badges} label="Badges" />
        </div>

        {/* Personal info */}
        <div className="mb-6 rounded-xl border border-[#e3d8bf] bg-[#fdf9ef]">
          <button
            type="button"
            onClick={() => setInfoOpen((o) => !o)}
            aria-expanded={infoOpen}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
          >
            Personal Info
            <svg
              viewBox="0 0 20 20"
              className={`h-4 w-4 text-[#6f6556] transition-transform ${infoOpen ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12 l5 -5 l5 5" />
            </svg>
          </button>

          {infoOpen && (
            <div className="flex flex-col gap-3 border-t border-[#e3d8bf] px-4 py-4">
              <InfoRow label="Name">
                {editing ? (
                  <input
                    className={inputBox}
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    aria-label="Name"
                  />
                ) : (
                  <span className={valueBox}>{profile.name}</span>
                )}
              </InfoRow>
              <InfoRow label="Email">
                <span className={valueBox}>{email}</span>
              </InfoRow>
              <InfoRow label="Joined">
                <span className={valueBox}>{formatJoined(profile.created_at)}</span>
              </InfoRow>
              {saveError && <p className="text-xs text-[#9a5a50]">{saveError}</p>}
            </div>
          )}
        </div>

        {editing ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={saveEdit}
              disabled={saving}
              className="rounded-lg bg-[#6b7d48] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#586a3a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="rounded-lg border border-[#6b7d48] px-5 py-2.5 text-sm text-[#586a3a] transition-colors hover:bg-[#e4ebd0]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="w-fit rounded-lg bg-[#6b7d48] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#586a3a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* ---------- Home screen: cozy desk with shortcuts ---------- */}
      <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[#e3d8bf] bg-[#fbf6ea] shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e3d8bf] px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#6b4a2f" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 5 q5 -2 8 1 q3 -3 8 -1 v13 q-5 -2 -8 1 q-3 -3 -8 -1 z M12 6 v13" />
            </svg>
            Boskip
          </div>
          <Clock />
        </div>

        <div className="relative flex-1">
          <img src={Desk} alt="A cozy desk with plants, a cat and an old computer" className="absolute inset-0 h-full w-full object-cover" />

          <nav aria-label="Home screen" className="absolute right-3 top-4 flex flex-col gap-3 sm:right-5">
            {SHORTCUTS.map(({ label, path, icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(path)}
                className="group flex flex-col items-center gap-1 focus-visible:outline-none"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d9c9a6] bg-[#fbf6ea]/90 shadow-sm transition-transform group-hover:-translate-y-0.5 group-focus-visible:ring-4 group-focus-visible:ring-[#b9c79a]">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#6b4a2f" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {icon}
                  </svg>
                </span>
                <span className="rounded bg-[#fbf6ea]/80 px-1.5 text-[0.7rem] italic text-[#6b4a2f]">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </section>
  )
}

export default Profile
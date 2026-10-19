// Put this file at src/lib/gameResults.js
import { supabase } from '@/lib/supabase'

// Saves a finished game and returns { xp_earned, level, xp, xp_needed, leveled_up }.
// Returns null if nobody is signed in or the save fails, so a game never breaks because of it.
export async function saveGameResult({ game, level = 0, won, score = null, seconds = null, moves = null, misses = null, hints = null }) {
  try {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth?.user) return null

    const { data, error } = await supabase.rpc('record_game_result', {
      p_game: game,
      p_level: level,
      p_won: won,
      p_score: score,
      p_seconds: seconds,
      p_moves: moves,
      p_misses: misses,
      p_hints: hints,
    })

    if (error) {
      console.error('Could not save game result:', error.message)
      return null
    }
    return data
  } catch (err) {
    console.error('Could not save game result:', err)
    return null
  }
}

// Returns all of this player's winning results for one game (newest first).
export async function getWinningResults(game) {
  try {
    const { data, error } = await supabase
      .from('game_results')
      .select('level, score, seconds, moves, created_at')
      .eq('game', game)
      .eq('won', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Could not load results:', error.message)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Could not load results:', err)
    return []
  }
}
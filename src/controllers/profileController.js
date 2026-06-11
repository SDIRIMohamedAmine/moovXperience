import { supabase } from '../lib/supabase.js'

export async function getMyProfile(req, res) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, phone, avatar_url, created_at, updated_at')
    .eq('id', req.user.id)
    .single()

  if (error) {
    return res.status(404).json({ error: 'Profile not found' })
  }

  res.json(data)
}

export async function updateMyProfile(req, res) {
  const { full_name, phone, avatar_url } = req.body

  const updates = {}

  if (full_name !== undefined) {
    if (typeof full_name !== 'string') {
      return res.status(400).json({ error: 'Invalid name' })
    }
    updates.full_name = full_name.trim().slice(0, 200)
  }

  if (phone !== undefined) {
    if (typeof phone !== 'string') {
      return res.status(400).json({ error: 'Invalid phone' })
    }
    updates.phone = phone.trim().slice(0, 50)
  }

  if (avatar_url !== undefined) {
    if (typeof avatar_url !== 'string') {
      return res.status(400).json({ error: 'Invalid avatar URL' })
    }
    updates.avatar_url = avatar_url.trim().slice(0, 2000)
  }

  // Only update if there are changes
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' })
  }

  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', req.user.id)
    .select('id, role, full_name, phone, avatar_url, created_at, updated_at')
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json(data)
}

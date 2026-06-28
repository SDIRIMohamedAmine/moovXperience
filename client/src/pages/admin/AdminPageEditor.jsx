import { useState, useEffect } from 'react'
import { useTranslation } from '../../i18n/LanguageContext'
import { useTheme } from '../../theme/ThemeContext'
import { isAdminLoggedIn } from '../../services/adminService'
import { Navigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import MediaUploader from '../../components/MediaUploader'
import { showToast } from '../../components/Toast'
import { fadeInUp, stagger, EASE } from '../../lib/animations'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const ICON_OPTIONS = [
  { value: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z', label: 'Lightning' },
  { value: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', label: 'Users' },
  { value: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', label: 'Shield' },
  { value: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z', label: 'Star' },
  { value: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z', label: 'Heart' },
  { value: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18', label: 'Bulb' },
  { value: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155', label: 'Chat' },
  { value: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605', label: 'Trophy' },
]

const SECTION_TYPES = [
  { value: 'stats', label: 'section_type_stats', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
  { value: 'mission', label: 'section_type_mission', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
  { value: 'services', label: 'section_type_services', icon: 'M11.42 15.17l-5.384-3.19a1.5 1.5 0 010-2.565l5.384-3.19a1.5 1.5 0 011.56 0l5.384 3.19a1.5 1.5 0 010 2.565l-5.384 3.19a1.5 1.5 0 01-1.56 0z' },
  { value: 'team', label: 'section_type_team', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
  { value: 'cta', label: 'section_type_cta', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z' },
]

function createEmptySection(type) {
  switch (type) {
    case 'stats': return { type, items: [{ value: '', label: '' }] }
    case 'mission': return { type, items: [{ icon: ICON_OPTIONS[0].value, title: '', description: '' }] }
    case 'services': return { type, items: [{ image: '', title: '', description: '' }] }
    case 'team': return { type, items: [{ image: '', name: '', role: '' }] }
    case 'cta': return { type, title: '', button_text: '', button_link: '/contact' }
    default: return { type, items: [] }
  }
}

// --- Styled Input Components ---
function FieldInput({ label, value, onChange, placeholder, type = 'text', ...props }) {
  return (
    <div>
      {label && <label className="block text-[10px] uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</label>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm transition-colors" spellCheck={false}
        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', outline: 'none' }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        {...props} />
    </div>
  )
}

function FieldTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      {label && <label className="block text-[10px] uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</label>}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-3 py-2.5 text-sm resize-none transition-colors"
        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', outline: 'none' }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
    </div>
  )
}

function IconButton({ onClick, disabled, children, title }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} aria-label={title}
      className="min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
      style={{ cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1, borderRadius: '8px' }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
      {children}
    </button>
  )
}

function RemoveButton({ onClick, title }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title}
      className="min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
      style={{ cursor: 'pointer', borderRadius: '8px' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.1)' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
      <svg className="w-4 h-4" fill="none" stroke="#F87171" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    </button>
  )
}

function AddItemButton({ onClick, label }) {
  return (
    <button type="button" onClick={onClick}
      className="min-h-[44px] px-4 py-2 text-xs font-medium transition-all"
      style={{ border: '1px dashed var(--border)', color: 'var(--accent)', borderRadius: '8px', cursor: 'pointer' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.backgroundColor = 'var(--accent-bg)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent' }}>
      + {label}
    </button>
  )
}

// --- Section Type Editors ---

function StatsEditor({ section, onChange, t }) {
  const updateItem = (i, field, value) => {
    const items = [...section.items]
    items[i] = { ...items[i], [field]: value }
    onChange({ ...section, items })
  }
  return (
    <div className="space-y-3">
      {section.items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="flex gap-3 items-end p-3" style={{ backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
          <div className="flex-1">
            <FieldInput label={t('admin.stats_value')} value={item.value} onChange={(v) => updateItem(i, 'value', v)} placeholder="50+" />
          </div>
          <div className="flex-1">
            <FieldInput label={t('admin.stats_label')} value={item.label} onChange={(v) => updateItem(i, 'label', v)} placeholder="Events" />
          </div>
          {section.items.length > 1 && (
            <RemoveButton onClick={() => onChange({ ...section, items: section.items.filter((_, j) => j !== i) })} title={t('admin.section_remove_item')} />
          )}
        </motion.div>
      ))}
      <AddItemButton onClick={() => onChange({ ...section, items: [...section.items, { value: '', label: '' }] })} label={t('admin.section_add_item')} />
    </div>
  )
}

function MissionEditor({ section, onChange, t }) {
  const updateItem = (i, field, value) => {
    const items = [...section.items]
    items[i] = { ...items[i], [field]: value }
    onChange({ ...section, items })
  }
  return (
    <div className="space-y-3">
      {section.items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="p-4 space-y-3" style={{ backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
            {section.items.length > 1 && <RemoveButton onClick={() => onChange({ ...section, items: section.items.filter((_, j) => j !== i) })} title={t('admin.section_remove_item')} />}
          </div>
          <div className="flex gap-2 flex-wrap">
            {ICON_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => updateItem(i, 'icon', opt.value)} aria-label={opt.label}
                className="w-10 h-10 flex items-center justify-center rounded-lg transition-all"
                style={{ backgroundColor: item.icon === opt.value ? 'var(--accent-bg)' : 'var(--bg-card)', border: `2px solid ${item.icon === opt.value ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer' }}>
                <svg className="w-4 h-4" fill="none" stroke={item.icon === opt.value ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={opt.value} />
                </svg>
              </button>
            ))}
          </div>
          <FieldInput label={t('admin.cms_section_title')} value={item.title} onChange={(v) => updateItem(i, 'title', v)} placeholder={t('admin.cms_section_title')} />
          <FieldTextarea label={t('admin.cms_section_desc')} value={item.description} onChange={(v) => updateItem(i, 'description', v)} placeholder={t('admin.cms_section_desc')} rows={2} />
        </motion.div>
      ))}
      <AddItemButton onClick={() => onChange({ ...section, items: [...section.items, { icon: ICON_OPTIONS[0].value, title: '', description: '' }] })} label={t('admin.section_add_item')} />
    </div>
  )
}

function ServicesEditor({ section, onChange, t }) {
  const updateItem = (i, field, value) => {
    const items = [...section.items]
    items[i] = { ...items[i], [field]: value }
    onChange({ ...section, items })
  }
  return (
    <div className="space-y-3">
      {section.items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="p-4 space-y-3" style={{ backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
            {section.items.length > 1 && <RemoveButton onClick={() => onChange({ ...section, items: section.items.filter((_, j) => j !== i) })} title={t('admin.section_remove_item')} />}
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t('admin.service_image')}</label>
            <MediaUploader files={item.image ? [{ url: item.image, type: 'image', name: 'service' }] : []}
              onChange={(files) => updateItem(i, 'image', files[0]?.url || '')} maxFiles={1} folder="pages" />
          </div>
          <FieldInput label={t('admin.service_title')} value={item.title} onChange={(v) => updateItem(i, 'title', v)} placeholder={t('admin.service_title')} />
          <FieldTextarea label={t('admin.service_description')} value={item.description} onChange={(v) => updateItem(i, 'description', v)} placeholder={t('admin.service_description')} rows={2} />
        </motion.div>
      ))}
      <AddItemButton onClick={() => onChange({ ...section, items: [...section.items, { image: '', title: '', description: '' }] })} label={t('admin.section_add_item')} />
    </div>
  )
}

function TeamEditor({ section, onChange, t }) {
  const updateItem = (i, field, value) => {
    const items = [...section.items]
    items[i] = { ...items[i], [field]: value }
    onChange({ ...section, items })
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {section.items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
          className="p-4 space-y-3" style={{ backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
            {section.items.length > 1 && <RemoveButton onClick={() => onChange({ ...section, items: section.items.filter((_, j) => j !== i) })} title={t('admin.section_remove_item')} />}
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t('admin.team_image')}</label>
            <MediaUploader files={item.image ? [{ url: item.image, type: 'image', name: 'team' }] : []}
              onChange={(files) => updateItem(i, 'image', files[0]?.url || '')} maxFiles={1} folder="pages" />
          </div>
          <FieldInput label={t('admin.team_name')} value={item.name} onChange={(v) => updateItem(i, 'name', v)} placeholder={t('admin.team_name')} />
          <FieldInput label={t('admin.team_role')} value={item.role} onChange={(v) => updateItem(i, 'role', v)} placeholder={t('admin.team_role')} />
        </motion.div>
      ))}
      <AddItemButton onClick={() => onChange({ ...section, items: [...section.items, { image: '', name: '', role: '' }] })} label={t('admin.section_add_item')} />
    </div>
  )
}

function CtaEditor({ section, onChange, t }) {
  return (
    <div className="space-y-3 p-4" style={{ backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
      <FieldInput label={t('admin.cta_title')} value={section.title || ''} onChange={(v) => onChange({ ...section, title: v })} placeholder={t('admin.cta_title')} />
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label={t('admin.cta_button_text')} value={section.button_text || ''} onChange={(v) => onChange({ ...section, button_text: v })} placeholder={t('admin.cta_button_text')} />
        <FieldInput label={t('admin.cta_button_link')} value={section.button_link || ''} onChange={(v) => onChange({ ...section, button_link: v })} placeholder="/contact" />
      </div>
    </div>
  )
}

// --- Section Card with Reorder ---

function SectionCard({ section, index, onChange, onRemove, onMoveUp, onMoveDown, total, t }) {
  const sectionType = SECTION_TYPES.find((st) => st.value === section.type)
  const typeEditors = { stats: StatsEditor, mission: MissionEditor, services: ServicesEditor, team: TeamEditor, cta: CtaEditor }
  const TypeEditor = typeEditors[section.type]

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25, ease: EASE }}
      className="p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <svg className="w-4 h-4" fill="none" stroke="var(--accent)" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={sectionType?.icon || ICON_OPTIONS[0].value} />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {sectionType ? t(`admin.${sectionType.label}`) : section.type}
            </span>
            <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>#{index + 1}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <IconButton onClick={onMoveUp} disabled={index === 0} title={t('admin.section_move_up')}>
            <svg className="w-4 h-4" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
          </IconButton>
          <IconButton onClick={onMoveDown} disabled={index === total - 1} title={t('admin.section_move_down')}>
            <svg className="w-4 h-4" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
          </IconButton>
          <RemoveButton onClick={onRemove} title={t('admin.section_remove_item')} />
        </div>
      </div>
      {/* Editor */}
      {TypeEditor && <TypeEditor section={section} onChange={onChange} t={t} />}
    </motion.div>
  )
}

// --- Section Type Picker ---

function SectionTypePicker({ onSelect, t }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {SECTION_TYPES.map((st) => (
        <button key={st.value} type="button" onClick={() => onSelect(st.value)}
          className="flex flex-col items-center gap-2 p-4 transition-all min-h-[44px]"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.backgroundColor = 'var(--accent-bg)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'var(--bg-card)' }}>
          <svg className="w-6 h-6" fill="none" stroke="var(--accent)" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={st.icon} />
          </svg>
          <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t(`admin.${st.label}`)}
          </span>
        </button>
      ))}
    </motion.div>
  )
}

// --- Main Editor ---

export default function AdminPageEditor() {
  const { t } = useTranslation()
  const { dark } = useTheme()
  const [lang, setLang] = useState('fr')
  const [pages, setPages] = useState({ fr: null, en: null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ tag: '', title: '', subtitle: '', sections: [], cover_image: '' })
  const [mediaFiles, setMediaFiles] = useState([])
  const [showTypePicker, setShowTypePicker] = useState(false)

  const fetchPage = (language) => {
    return fetch(`${API_URL}/pages/about?lang=${language}`).then((r) => r.json()).catch(() => null)
  }

  useEffect(() => {
    if (!isAdminLoggedIn()) return
    setLoading(true)
    Promise.all([fetchPage('fr'), fetchPage('en')]).then(([fr, en]) => {
      setPages({ fr, en })
      const current = lang === 'fr' ? fr : en
      if (current) {
        setForm({ tag: current.tag || '', title: current.title || '', subtitle: current.subtitle || '', sections: current.sections || [], cover_image: current.cover_image || '' })
        if (current.cover_image) setMediaFiles([{ url: current.cover_image, type: 'image', name: 'cover' }])
      }
      setLoading(false)
    })
  }, [])

  const switchLang = (newLang) => {
    setLang(newLang)
    const data = pages[newLang]
    if (data) {
      setForm({ tag: data.tag || '', title: data.title || '', subtitle: data.subtitle || '', sections: data.sections || [], cover_image: data.cover_image || '' })
      if (data.cover_image) setMediaFiles([{ url: data.cover_image, type: 'image', name: 'cover' }])
      else setMediaFiles([])
    } else {
      setForm({ tag: '', title: '', subtitle: '', sections: [], cover_image: '' })
      setMediaFiles([])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const token = localStorage.getItem('admin-token')
    try {
      const res = await fetch(`${API_URL}/admin/pages/about`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lang, ...form, cover_image: mediaFiles[0]?.url || '' }),
      })
      if (res.ok) showToast(t('admin.page_saved'), 'success')
      else showToast(t('admin.error_msg'), 'error')
    } catch { showToast(t('admin.error_msg'), 'error') }
    setSaving(false)
  }

  const updateSection = (index, newSection) => {
    const updated = [...form.sections]
    updated[index] = newSection
    setForm({ ...form, sections: updated })
  }

  const removeSection = (index) => {
    setForm({ ...form, sections: form.sections.filter((_, i) => i !== index) })
  }

  const moveSection = (from, to) => {
    const updated = [...form.sections]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    setForm({ ...form, sections: updated })
  }

  const addSection = (type) => {
    setForm({ ...form, sections: [...form.sections, createEmptySection(type)] })
    setShowTypePicker(false)
  }

  if (!isAdminLoggedIn()) return <Navigate to="/admin/login" replace />

  const card = { backgroundColor: dark ? '#141414' : '#FAFAFA', border: `1px solid ${dark ? '#1a1a1a' : '#E8E8EC'}`, borderRadius: '12px' }
  const inputStyle = { backgroundColor: dark ? '#0F0F14' : '#FFFFFF', border: `1px solid ${dark ? '#1a1a1a' : '#E8E8EC'}`, color: dark ? '#F5F5F7' : '#1A1A2E', borderRadius: '8px', width: '100%', padding: '10px 14px', fontSize: '14px', outline: 'none' }
  const labelStyle = { color: dark ? '#666' : '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600', marginBottom: '6px', display: 'block' }

  return (
    <div className="min-h-screen" style={{ backgroundColor: dark ? '#0D0D0D' : '#FFFFFF' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/admin" className="text-xs uppercase tracking-wider mb-2 inline-block" style={{ color: 'var(--accent)' }}>{t('admin.dashboard')}</Link>
            <h1 className="text-2xl font-bold" style={{ color: dark ? '#FFF' : '#1A1A2E' }}>{t('admin.page_editor')}</h1>
            <p className="text-sm mt-1" style={{ color: dark ? '#666' : '#888' }}>{t('admin.page_editor_desc')} — About</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="min-h-[44px] px-6 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all hover:scale-[1.02]"
            style={{ background: 'var(--accent-gradient)', color: '#FFF', borderRadius: '9999px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? '...' : t('admin.blog_save')}
          </button>
        </div>

        {/* Language tabs */}
        <div className="flex gap-1 mb-6 p-1" style={{ backgroundColor: dark ? '#141414' : '#F0F0F0', borderRadius: '10px', width: 'fit-content' }}>
          {['fr', 'en'].map((l) => (
            <button key={l} onClick={() => switchLang(l)} aria-label={`Switch to ${l}`}
              className="min-h-[44px] px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all"
              style={{ backgroundColor: lang === l ? (dark ? '#1a1a1a' : '#FFFFFF') : 'transparent', color: lang === l ? 'var(--accent)' : (dark ? '#666' : '#999'), borderRadius: '8px', cursor: 'pointer' }}>
              {l === 'fr' ? 'Francais' : 'English'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-20 rounded-xl" style={{ backgroundColor: dark ? '#141414' : '#F0F0F0' }} />)}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hero section */}
            <motion.div initial="hidden" animate="visible" variants={stagger} style={card} className="p-5">
              <motion.div variants={fadeInUp}>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: dark ? '#FFF' : '#1A1A2E' }}>
                  <svg className="w-5 h-5" fill="none" stroke="var(--accent)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  Hero
                </h3>
              </motion.div>
              <div className="space-y-4">
                <motion.div variants={fadeInUp}><FieldInput label={t('admin.cms_tag')} value={form.tag} onChange={(v) => setForm({ ...form, tag: v })} placeholder="About Us" /></motion.div>
                <motion.div variants={fadeInUp}><FieldInput label={t('admin.cms_title')} value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Who We Are" /></motion.div>
                <motion.div variants={fadeInUp}><FieldTextarea label={t('admin.cms_subtitle')} value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} placeholder="A short description..." rows={3} /></motion.div>
                <motion.div variants={fadeInUp}>
                  <label className="block text-[10px] uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t('admin.editor_cover_image')}</label>
                  <MediaUploader files={mediaFiles} onChange={setMediaFiles} maxFiles={1} folder="pages" />
                </motion.div>
              </div>
            </motion.div>

            {/* Sections */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold" style={{ color: dark ? '#FFF' : '#1A1A2E' }}>{t('admin.cms_sections')}</h3>
                <button type="button" onClick={() => setShowTypePicker(!showTypePicker)}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold transition-all"
                  style={{ background: showTypePicker ? 'var(--accent-bg)' : 'transparent', border: `1px solid ${showTypePicker ? 'var(--accent)' : 'var(--border)'}`, color: 'var(--accent)', borderRadius: '8px', cursor: 'pointer' }}>
                  {showTypePicker ? t('common.cancel') : `+ ${t('admin.cms_add_section')}`}
                </button>
              </div>

              <AnimatePresence>
                {showTypePicker && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                    className="mb-4 overflow-hidden">
                    <SectionTypePicker onSelect={addSection} t={t} />
                  </motion.div>
                )}
              </AnimatePresence>

              {form.sections.length === 0 && !showTypePicker && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16" style={card}>
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke={dark ? '#333' : '#DDD'} strokeWidth="1" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <p className="text-sm mb-4" style={{ color: dark ? '#555' : '#999' }}>{t('admin.editor_no_content')}</p>
                  <button type="button" onClick={() => setShowTypePicker(true)}
                    className="min-h-[44px] px-6 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: 'var(--accent-gradient)', color: '#FFF', borderRadius: '9999px', cursor: 'pointer' }}>
                    + {t('admin.cms_add_section')}
                  </button>
                </motion.div>
              )}

              <AnimatePresence>
                <div className="space-y-4">
                  {form.sections.map((section, i) => (
                    <SectionCard key={`${section.type}-${i}`} section={section} index={i} total={form.sections.length} t={t}
                      onChange={(newSection) => updateSection(i, newSection)}
                      onRemove={() => removeSection(i)}
                      onMoveUp={() => moveSection(i, i - 1)}
                      onMoveDown={() => moveSection(i, i + 1)} />
                  ))}
                </div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

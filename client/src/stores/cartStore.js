import { create } from 'zustand'

const STORAGE_KEY = 'moovxperience-cart'

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* corrupted storage, use defaults */ }
  return { items: [] }
}

function saveCart(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }))
  } catch { /* storage full or unavailable */ }
}

const useCartStore = create((set, get) => ({
  items: loadCart().items,

  addItem: (product, quantity = 1, mode = 'rental', startDate = null, endDate = null, selectedOptions = []) => {
    const qty = Math.max(1, Math.min(100, Math.floor(Number(quantity) || 1)))
    const { items } = get()

    // Create unique key based on product + mode + dates
    const key = `${product.id}-${mode}-${startDate || ''}-${endDate || ''}`
    const existing = items.find(i => i.key === key)

    let newItems
    if (existing) {
      newItems = items.map(i =>
        i.key === key
          ? { ...i, quantity: Math.min(100, i.quantity + qty) }
          : i
      )
    } else {
      newItems = [...items, {
        key,
        product_id: product.id,
        name: product.name,
        price_per_day: product.price_per_day,
        price_purchase: product.price_purchase,
        images: product.images || [],
        quantity: qty,
        mode, // 'rental' or 'purchase'
        startDate,
        endDate,
        options: selectedOptions,
      }]
    }

    set({ items: newItems })
    saveCart({ ...get(), items: newItems })
  },

  removeItem: (key) => {
    const newItems = get().items.filter(i => i.key !== key)
    set({ items: newItems })
    saveCart({ ...get(), items: newItems })
  },

  updateQuantity: (key, quantity) => {
    if (quantity < 1) return get().removeItem(key)
    const newItems = get().items.map(i =>
      i.key === key ? { ...i, quantity } : i
    )
    set({ items: newItems })
    saveCart({ ...get(), items: newItems })
  },

  updateDates: (key, startDate, endDate) => {
    const newItems = get().items.map(i =>
      i.key === key ? { ...i, startDate, endDate } : i
    )
    set({ items: newItems })
    saveCart({ ...get(), items: newItems })
  },

  clearCart: () => {
    set({ items: [] })
    saveCart({ items: [] })
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },

  getItemTotal: (item) => {
    if (item.mode === 'purchase') {
      return (item.price_purchase || 0) * item.quantity
    }
    // Rental
    if (!item.startDate || !item.endDate) return 0
    const start = new Date(item.startDate)
    const end = new Date(item.endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    const optionsTotal = (item.options || []).reduce((sum, opt) => sum + (opt.price || 0), 0)
    return (item.price_per_day * item.quantity + optionsTotal) * days
  },

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + get().getItemTotal(item), 0)
  },
}))

export { useCartStore }
export default useCartStore

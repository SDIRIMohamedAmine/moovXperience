// Shared animation variants for framer-motion
// Single source of truth — all pages import from here

export const EASE = [0.22, 1, 0.36, 1]

export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: EASE },
  }),
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: EASE },
  },
}

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE },
  },
}

export const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE },
  },
}

// Reusable whileHover config for cards
export const cardHover = {
  y: -6,
  transition: { duration: 0.25, ease: EASE },
}

// Section-level viewport trigger config
export const viewportOnce = { once: true, margin: '-50px' }

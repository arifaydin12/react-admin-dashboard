const isApple = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)

/** Label of the shortcut modifier key on the current platform. */
export const MOD_KEY_LABEL = isApple ? '⌘' : 'Ctrl'

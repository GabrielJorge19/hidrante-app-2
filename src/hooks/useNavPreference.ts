import { useState } from 'react'
import { getNavOption, setNavOption, type NavOption } from '../lib/preferences'

export function useNavPreference(): {
  navOption: NavOption
  setNav: (option: NavOption) => void
} {
  const [navOption, setNavState] = useState(getNavOption)

  function setNav(option: NavOption): void {
    setNavOption(option)
    setNavState(option)
  }

  return { navOption, setNav }
}
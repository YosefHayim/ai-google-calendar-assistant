'use client'

import { useState, useEffect, useCallback } from 'react'

const ONBOARDING_STORAGE_KEY = 'ally-onboarding-completed'

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    const isCompleted = completed === 'true'
    setHasCompletedOnboarding(isCompleted)
    if (!isCompleted) {
      setShowOnboarding(true)
    }
  }, [])

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    setHasCompletedOnboarding(true)
    setShowOnboarding(false)
  }, [])

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    setHasCompletedOnboarding(false)
    setShowOnboarding(true)
  }, [])

  const openOnboarding = useCallback(() => {
    setShowOnboarding(true)
  }, [])

  const closeOnboarding = useCallback(() => {
    setShowOnboarding(false)
  }, [])

  return {
    showOnboarding,
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding,
    openOnboarding,
    closeOnboarding,
  }
}

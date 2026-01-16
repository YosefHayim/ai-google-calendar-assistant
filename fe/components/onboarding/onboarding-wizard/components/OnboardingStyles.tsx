'use client'

export function OnboardingStyles() {
  return (
    <style jsx global>{`
      .onboarding-highlight {
        position: relative;
        z-index: 50;
        box-shadow:
          0 0 0 4px rgba(var(--primary-rgb, 139, 92, 246), 0.5),
          0 0 20px rgba(var(--primary-rgb, 139, 92, 246), 0.3);
        border-radius: 8px;
        animation: pulse-highlight 2s ease-in-out infinite;
      }

      @keyframes pulse-highlight {
        0%,
        100% {
          box-shadow:
            0 0 0 4px rgba(var(--primary-rgb, 139, 92, 246), 0.5),
            0 0 20px rgba(var(--primary-rgb, 139, 92, 246), 0.3);
        }
        50% {
          box-shadow:
            0 0 0 8px rgba(var(--primary-rgb, 139, 92, 246), 0.3),
            0 0 30px rgba(var(--primary-rgb, 139, 92, 246), 0.4);
        }
      }

      .onboarding-overlay {
        background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
      }
    `}</style>
  )
}

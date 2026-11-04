interface AuthLogoProps {
  className?: string
}

function AuthLogo({ className }: AuthLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" />
      <path d="M9.5 7.5h5" />
      <path d="M10.5 7.5v-1h3v1" />
      <path d="M9.5 10h5" />
      <path d="M10.5 10v3.5h3V10" />
    </svg>
  )
}

export default AuthLogo

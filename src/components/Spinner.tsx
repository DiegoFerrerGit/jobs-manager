export default function Spinner({ className = "w-5 h-5", color = "text-primary", ...props }: React.SVGProps<SVGSVGElement> & { color?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Spinning outer ring */}
      <svg className={`animate-spin absolute w-full h-full ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
        <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"></circle>
        <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {/* The pulsing center, optional, but we can make it part of it or just leave it empty if used small, but the user wants "mismo comportamiento" */}
    </div>
  );
}

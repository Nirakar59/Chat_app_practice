const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md w-full text-center">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`
                aspect-square rounded-2xl
                ${i % 3 === 0
                  ? 'bg-primary/20 animate-pulse'
                  : i % 3 === 1
                    ? 'bg-secondary/20 animate-bounce'
                    : 'bg-accent/20 hover:scale-105 transition-transform duration-300'
                }
              `}
            />
          ))}
        </div>

        <h2 className="text-3xl font-extrabold text-base-content mb-3 leading-tight">
          {title}
        </h2>
        <p className="text-base-content/70 text-base leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

export default AuthImagePattern

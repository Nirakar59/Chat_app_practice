const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="flex items-center justify-center bg-base-200 p-8 md:p-12 lg:p-16">
      <div className="max-w-md w-full text-center">
        {/* Pattern Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`
                aspect-square rounded-2xl shadow-md
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

        {/* Title & Subtitle */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-base-content mb-3 leading-tight">
          {title}
        </h2>
        <p className="text-base md:text-lg text-base-content/70 leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

export default AuthImagePattern
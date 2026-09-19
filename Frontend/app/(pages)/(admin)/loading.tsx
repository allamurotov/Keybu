export default function AdminLoading() {
  return (
    <div className="flex-1 flex items-center justify-center h-full min-h-[80vh] bg-white rounded-2xl m-4 border border-gray-100 shadow-sm relative overflow-hidden">
      
      <div className="relative flex flex-col items-center">
        <div className="relative">
          <svg 
            viewBox="0 0 100 50" 
            className="w-40 h-20 md:w-56 md:h-28"
          >
            <defs>
              <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            
            <path
              d="M 25 40 C 5 40 5 10 25 10 C 45 10 55 40 75 40 C 95 40 95 10 75 10 C 55 10 45 40 25 40 Z"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="4"
              strokeLinecap="round"
            />
            
            <path
              d="M 25 40 C 5 40 5 10 25 10 C 45 10 55 40 75 40 C 95 40 95 10 75 10 C 55 10 45 40 25 40 Z"
              fill="none"
              stroke="url(#infinityGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              pathLength="100"
              style={{
                strokeDasharray: "35 65",
                strokeDashoffset: "100",
                animation: "infinityDash 2s linear infinite"
              }}
            />
          </svg>
        </div>
        
        <p className="mt-8 text-blue-600 font-semibold tracking-[0.3em] uppercase text-xs sm:text-sm animate-pulse">
          Yuklanmoqda...
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes infinityDash {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
        `
      }} />
    </div>
  );
}

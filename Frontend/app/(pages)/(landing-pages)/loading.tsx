export default function Loading() {
  return (
    <div className="flex h-[70vh] flex-col bg-white">
      <main className="flex flex-1 flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Outer ping animation */}
          <div className="absolute h-20 w-20 animate-ping rounded-full bg-blue-100 opacity-75"></div>
          
          {/* Main spinning ring */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-slate-100 border-t-[#0047FF] animate-spin"></div>
          
          {/* Inner Logo/Icon */}
          <div className="absolute flex items-center justify-center text-[#0047FF]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
        </div>
        <h3 className="mt-8 text-lg font-medium text-slate-600 animate-pulse">Yuklanmoqda...</h3>
      </main>
    </div>
  );
}

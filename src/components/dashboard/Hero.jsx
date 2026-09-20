function Hero() {
  return (
    <section className="px-4 pt-6 sm:pt-10 pb-2 text-center">
      <h1 className="text-2xl font-light text-slate-800 sm:text-4xl md:text-5xl leading-tight tracking-tight">
        Find Your Next Home with <span className="font-semibold text-teal-600">Zero Brokerage</span>
      </h1>

      <p className="mx-auto mt-2 sm:mt-3 max-w-2xl text-xs sm:text-base text-slate-600 leading-relaxed">
        Browse verified rental flats, independent houses, villas, and PG accommodations directly from property owners.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-left text-[11px] sm:text-xs text-slate-600 font-medium sm:flex sm:flex-wrap sm:justify-center sm:items-center sm:gap-x-6 sm:gap-y-2 sm:text-center">
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 shadow-xs sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <span className="text-teal-600 font-bold">✓</span>
          <span>100% Brokerage Free</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 shadow-xs sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <span className="text-teal-600 font-bold">✓</span>
          <span>Direct Owner Connect</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 shadow-xs sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <span className="text-teal-600 font-bold">✓</span>
          <span>Verified Listings</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 shadow-xs sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <span className="text-teal-600 font-bold">✓</span>
          <span>Instant HRA Receipts</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;

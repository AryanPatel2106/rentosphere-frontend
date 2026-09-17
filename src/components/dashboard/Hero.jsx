function Hero() {
  return (
    <section className="px-4 pt-10 pb-2 text-center">
      <h1 className="text-3xl font-light text-gray-800 sm:text-4xl md:text-5xl">
        Find Your Next Home with <span className="font-semibold text-[#009587]">Zero Brokerage</span>
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-gray-600 leading-relaxed">
        Browse verified rental flats, independent houses, villas, and PG accommodations directly from property owners.
      </p>

      <div className="mt-4 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-gray-500 font-medium">
        <span className="flex items-center gap-1.5">✓ 100% Brokerage Free</span>
        <span className="flex items-center gap-1.5">✓ Direct Owner Connect</span>
        <span className="flex items-center gap-1.5">✓ Verified Property Listings</span>
        <span className="flex items-center gap-1.5">✓ Instant HRA Rent Receipts</span>
      </div>
    </section>
  );
}

export default Hero;

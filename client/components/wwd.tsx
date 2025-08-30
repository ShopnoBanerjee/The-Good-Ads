"use client";
import Link from "next/link";

const Wwd: React.FC = () => {
  return (
    <section className="relative">
      {/* Bg img */}
      <div
        className="absolute inset-0 bg-[url('/backgrounds/wwd-bg.jpg')] bg-cover bg-center opacity-90 pointer-events-none"
        aria-hidden="true"
      />

      {/* Component content */}
      <div className="relative z-10 bg-[#1679A8] bg-opacity-80 text-white py-8 sm:py-12 md:py-16 lg:py-20 pb-[110px] sm:pb-[120px] md:pb-[150px] lg:pb-[180px] xl:pb-[300px] px-4 sm:px-6 md:px-8 lg:px-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-center mb-6 sm:mb-8 font-outfit drop-shadow-2xl leading-tight">
          What We Do?
        </h2>

        {/* WWD- Row 1 */}
        <div className="max-w-xs sm:max-w-2xl md:max-w-4xl mx-auto text-center mb-6 sm:mb-8 lg:mb-0">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-relaxed">
            Whether you're a brand looking to tap into fresh, creative energy or a student group eager to showcase your talent to real-world clients, The GoodAds is your launchpad.
          </p>
        </div>

        {/* WWD- Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-8 lg:gap-12 mt-8 sm:mt-12 lg:mt-4">
          <div className="relative z-0 order-2 lg:order-1">
            <div className="absolute inset-0 bg-[#1986A4] opacity-30 blur-2xl rounded-full z-0" />
            <div className="p-4 sm:p-6 relative z-10">
              <p className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-medium ml-2 sm:ml-4 lg:ml-6 font-outfit leading-tight">
                We<span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-semibold drop-shadow-md"> Connect </span>businesses<br />with student creators
              </p>
              <p className="pt-4 sm:pt-6 lg:pt-8 pl-2 sm:pl-4 lg:pl-6 font-normal text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl leading-relaxed">
                We bridge the gap between innovative companies and the brightest college talent. We match you with the right student teams to drive real, actionable results tailored to your industry needs.
              </p>
            </div>
          </div>

          <div className="flex justify-center overflow-hidden order-1 lg:order-2">
            <img
              src="/illustrations/illus2whatwedo.png"
              alt="Illustration 1"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl h-auto object-contain rounded-lg"
            />
          </div>
        </div>

        {/* WWD- Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-8 lg:gap-12 mt-8 sm:mt-12 lg:mt-4">
          <div className="flex justify-center overflow-hidden">
            <img
              src="/illustrations/illus whatwedo.png"
              alt="Illustration 2"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-auto object-contain rounded-lg"
            />
          </div>

          <div className="relative z-0">
            <div className="absolute inset-0 bg-[#1986A4] opacity-30 blur-2xl rounded-full z-0" />
            <div className="p-4 sm:p-6 relative z-10">
              <p className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-medium ml-2 sm:ml-4 lg:ml-6 font-outfit leading-tight">
                We<span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-semibold drop-shadow-md"> Support </span>businesses<br />across industries
              </p>
              <p className="pt-4 sm:pt-6 lg:pt-8 pl-2 sm:pl-4 lg:pl-6 font-normal text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl leading-relaxed">
                From finance and consulting to marketing, tech, and multimedia production, we provide companies with agile, cost-effective solutions through the creativity of student societies.
              </p>
            </div>
          </div>
        </div>

        {/* Our Services */}
        <div className="mt-12 sm:mt-16 lg:mt-20 xl:mt-24 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 lg:mb-12 font-outfit text-white drop-shadow-2xl leading-tight">
            Our Services To
          </h2>

          <div className="relative mx-auto w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
            <div className="flex flex-col sm:flex-row w-full rounded-t-3xl sm:rounded-tl-3xl sm:rounded-tr-3xl rounded-br-3xl sm:rounded-br-[120px] md:rounded-br-[180px] lg:rounded-br-[233px] rounded-bl-3xl sm:rounded-bl-[120px] md:rounded-bl-[180px] lg:rounded-bl-[233px] shadow-[0px_4px_4px_5px_rgba(0,0,0,0.25)] overflow-hidden">
              
              {/* Left Half - College Societies */}
              <Link
                href="/college-societies"
                className="w-full sm:w-1/2 bg-[#92d4e6] flex items-center justify-center hover:bg-[#e6f7fb] transition-colors duration-200 rounded-t-3xl sm:rounded-tl-3xl sm:rounded-tr-none rounded-bl-none sm:rounded-bl-[120px] md:rounded-bl-[180px] lg:rounded-bl-[233px] shadow-none sm:shadow-[10px_0px_5px_rgba(0,0,0,0.25)] z-10 min-h-[120px] sm:min-h-[200px] md:min-h-[300px] lg:min-h-[400px]"
              >
                <div className="text-[#1a5173] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold font-outfit drop-shadow-2xl text-center leading-tight">
                  College<br />Societies
                </div>
              </Link>

              {/* Right Half - Companies/Startups */}
              <Link
                href="/companies-startups"
                className="w-full sm:w-1/2 bg-[#A3DAEF] flex items-center justify-center hover:bg-[#e6f7fb] transition-colors duration-200 rounded-b-3xl sm:rounded-tr-3xl sm:rounded-bl-none rounded-br-3xl sm:rounded-br-[120px] md:rounded-br-[180px] lg:rounded-br-[233px] min-h-[120px] sm:min-h-[200px] md:min-h-[300px] lg:min-h-[400px]"
              >
                <div className="text-[#1a5173] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold font-outfit drop-shadow-2xl text-center leading-tight">
                  Companies/<br />Startups
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative overlay image - overlaps buttons on larger screens */}
      <img
        src="/illustrations/comb standing.png"
        alt="Decorative Overlay"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl h-auto pointer-events-none lg:-translate-y-0 xl:-translate-y-0"
      />
    </section>
  );
};

export default Wwd;

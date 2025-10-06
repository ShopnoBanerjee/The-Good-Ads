"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

const Wwd: React.FC = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <section className="relative">
        <div
          className="absolute inset-0 bg-[url('/backgrounds/wwd-bg.jpg')] bg-cover bg-center opacity-90 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 bg-[#1679A8] bg-opacity-80 text-white py-8 sm:py-12 md:py-16 lg:py-20 pb-[110px] sm:pb-[120px] md:pb-[150px] lg:pb-[180px] xl:pb-[300px] px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="w-96 h-20 bg-gray-700 animate-pulse rounded mx-auto"></div>
          <div className="w-full h-96 bg-gray-700 animate-pulse rounded mt-8"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      {/* Bg img */}
      <div
        className="absolute inset-0 bg-[url('/backgrounds/wwd-bg.jpg')] bg-cover bg-center opacity-90 pointer-events-none"
        aria-hidden="true"
      />

      {/* Component content */}
      <div 
        className="relative z-10 text-white py-8 sm:py-12 md:py-16 lg:py-20 pb-[110px] sm:pb-[120px] md:pb-[150px] lg:pb-[180px] xl:pb-[300px] px-4 sm:px-6 md:px-8 lg:px-12 transition-colors duration-200 ease-in-out"
        style={{
          backgroundColor: theme === "dark" ? "rgba(21, 50, 90, 0.85)" : "rgba(22, 121, 168, 0.8)",
          transition: 'background-color 0.2s ease-in-out',
        }}
      >
        <h2 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-center mb-6 sm:mb-8 font-outfit drop-shadow-2xl leading-tight transition-colors duration-200 ease-in-out"
          style={{
            color: theme === "dark" ? "#ffffff" : "#ffffff",
            transition: 'color 0.2s ease-in-out',
          }}
        >
          What We Do?
        </h2>

        {/* WWD- Row 1 */}
        <div className="max-w-xs sm:max-w-2xl md:max-w-4xl mx-auto text-center mb-6 sm:mb-8 lg:mb-0">
          <p 
            className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-relaxed transition-colors duration-200 ease-in-out"
            style={{
              color: theme === "dark" ? "#e0e0e0" : "#ffffff",
              transition: 'color 0.2s ease-in-out',
            }}
          >
            inHalt connects businesses with college societies and student-run organizations for innovative consulting and project needs, showcasing each society’s portfolio and achievements for transparent, informed partnerships
          </p>
        </div>

        {/* WWD- Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-8 lg:gap-12 mt-8 sm:mt-12 lg:mt-4">
          <div className="relative z-0 order-2 lg:order-1">
            <div 
              className="absolute inset-0 opacity-30 blur-2xl rounded-full z-0 transition-colors duration-200 ease-in-out"
              style={{
                backgroundColor: theme === "dark" ? "#1f5f7a" : "#1986A4",
                transition: 'background-color 0.2s ease-in-out',
              }}
            />
            <div className="p-4 sm:p-6 relative z-10">
              <p 
                className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-medium ml-2 sm:ml-4 lg:ml-6 font-outfit leading-tight transition-colors duration-200 ease-in-out"
                style={{
                  transition: 'color 0.2s ease-in-out',
                }}
              >
                We<span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-semibold drop-shadow-md"> Connect </span>businesses<br />with students
              </p>
              <p 
                className="pt-4 sm:pt-6 lg:pt-8 pl-2 sm:pl-4 lg:pl-6 font-normal text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl leading-relaxed transition-colors duration-200 ease-in-out"
                style={{
                  color: theme === "dark" ? "#e0e0e0" : "#ffffff",
                  transition: 'color 0.2s ease-in-out',
                }}
              >
                We bridge the gap between innovative companies and the brightest college talent. Students gain real-world experience and sustainable revenue.
              </p>
            </div>
          </div>

          <div className="flex justify-center overflow-hidden order-1 lg:order-2 relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl h-64 sm:h-80 md:h-96 lg:h-[400px] xl:h-[500px]">
            <Image
              fill
              src="/illustrations/illus2whatwedo.png"
              alt="Illustration 1"
              className="object-contain rounded-lg"
            />
          </div>
        </div>

        {/* WWD- Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-8 lg:gap-12 mt-8 sm:mt-12 lg:mt-4">
          <div className="flex justify-center overflow-hidden relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-64 sm:h-80 md:h-96 lg:h-[400px] xl:h-[450px]">
            <Image
              fill
              src="/illustrations/illus whatwedo.png"
              alt="Illustration 2"
              className="object-contain rounded-lg"
            />
          </div>

          <div className="relative z-0">
            <div 
              className="absolute inset-0 opacity-30 blur-2xl rounded-full z-0 transition-colors duration-200 ease-in-out"
              style={{
                backgroundColor: theme === "dark" ? "#1f5f7a" : "#1986A4",
                transition: 'background-color 0.2s ease-in-out',
              }}
            />
            <div className="p-4 sm:p-6 relative z-10">
              <p 
                className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-medium ml-2 sm:ml-4 lg:ml-6 font-outfit leading-tight transition-colors duration-200 ease-in-out"
                style={{
                  transition: 'color 0.2s ease-in-out',
                }}
              >
                We<span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-semibold drop-shadow-md"> Support </span>businesses<br />across industries
              </p>
              <p 
                className="pt-4 sm:pt-6 lg:pt-8 pl-2 sm:pl-4 lg:pl-6 font-normal text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl leading-relaxed transition-colors duration-200 ease-in-out"
                style={{
                  color: theme === "dark" ? "#e0e0e0" : "#ffffff",
                  transition: 'color 0.2s ease-in-out',
                }}
              >
                From finance and consulting to marketing, tech, and multimedia production, companies can efficiently outsource to credible, niche-focused teams by reviewing past projects and testimonials.
              </p>
            </div>
          </div>
        </div>

        {/* Our Services */}
        <div className="mt-12 sm:mt-16 lg:mt-20 xl:mt-24 text-center">
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 lg:mb-12 font-outfit text-white drop-shadow-2xl leading-tight transition-colors duration-200 ease-in-out"
            style={{
              transition: 'color 0.2s ease-in-out',
            }}
          >
            Our Services To
          </h2>

          <div className="relative mx-auto w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
            <div className="flex flex-col sm:flex-row w-full rounded-t-3xl sm:rounded-tl-3xl sm:rounded-tr-3xl rounded-br-3xl sm:rounded-br-[120px] md:rounded-br-[180px] lg:rounded-br-[233px] rounded-bl-3xl sm:rounded-bl-[120px] md:rounded-bl-[180px] lg:rounded-bl-[233px] shadow-[0px_4px_4px_5px_rgba(0,0,0,0.25)] overflow-hidden">
              
              {/* Left Half - College Societies */}
              <Link
                href="/our-services"
                className="w-full sm:w-1/2 bg-[#92d4e6] dark:bg-[#2b4c66] text-[#1a5173] dark:text-white flex items-center justify-center hover:bg-[#7dc4d9] dark:hover:bg-[#1e3c52] hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-t-3xl sm:rounded-tl-3xl sm:rounded-tr-none rounded-bl-none sm:rounded-bl-[120px] md:rounded-bl-[180px] lg:rounded-bl-[233px] shadow-none sm:shadow-[10px_0px_5px_rgba(0,0,0,0.25)] z-10 min-h-[120px] sm:min-h-[200px] md:min-h-[300px] lg:min-h-[400px]"
                style={{
                  transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out, transform 0.3s ease-in-out',
                }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold font-outfit drop-shadow-2xl text-center leading-tight">
                  College<br />Societies
                </div>
              </Link>

              {/* Right Half - Companies/Startups */}
              <Link
                href="/our-services"
                className="w-full sm:w-1/2 bg-[#A3DAEF] dark:bg-[#34546b] text-[#1a5173] dark:text-white flex items-center justify-center hover:bg-[#8ed1eb] dark:hover:bg-[#274157] hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-b-3xl sm:rounded-tr-3xl sm:rounded-bl-none rounded-br-3xl sm:rounded-br-[120px] md:rounded-br-[180px] lg:rounded-br-[233px] min-h-[120px] sm:min-h-[200px] md:min-h-[300px] lg:min-h-[400px]"
                style={{
                  transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out, transform 0.3s ease-in-out',
                }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold font-outfit drop-shadow-2xl text-center leading-tight">
                  Companies/<br />Startups
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative overlay image - overlaps buttons on larger screens */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl h-64 sm:h-80 md:h-96 lg:h-[400px] xl:h-[500px] pointer-events-none lg:-translate-y-0 xl:-translate-y-0">
        <Image
          fill
          src="/illustrations/comb standing.png"
          alt="Decorative Overlay"
          className="object-contain"
        />
      </div>
    </section>
  );
};

export default Wwd;

"use client";

import Image from "next/image";

export default function About() {
    return (
        <section
            id="about"
            className="h-screen flex justify-center items-center px-4 sm:px-8 text-center"
        >
            <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
                {/* Left side: About Me text */}
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start order-2 md:order-1">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center md:text-left">
                        About Me
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg leading-relaxed text-center md:text-left">
                        I'm a developer passionate about building robust authentication flows,
                        admin dashboards, and polished user experiences. I love crafting
                        responsive interfaces and bringing playful UI ideas to life.
                    </p>
                </div>

                {/* Right side: Image */}
                <div className="w-full md:w-1/2 flex justify-center md:justify-end order-1 md:order-2">
                    <div className="w-80 h-80 sm:w-96 sm:h-96 md:w-96 md:h-96 rounded-2xl shadow-xl overflow-hidden transition-shadow duration-700 group relative">
                        <Image
                            src="/image/Sean.jpg"
                            alt="Sean profile"
                            fill
                            className="object-cover w-full h-full transform scale-100 transition-transform duration-500 ease-in-out group-hover:animate-[smooth-zoom_1s_ease-in-out_forwards]"
                            priority
                            quality={100}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

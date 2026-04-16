import React, { useState, useEffect } from 'react'
import { useUIStore } from '../context/store'

export const Carousel = ({ slides, autoPlay = true, interval = 5000 }) => {
  const [current, setCurrent] = useState(0)
  const isDark = useUIStore((state) => state.isDark)

  useEffect(() => {
    if (!autoPlay) return

    const slideTimer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, interval)

    return () => clearInterval(slideTimer)
  }, [autoPlay, interval, slides.length])

  const goToSlide = (index) => setCurrent(index)
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div
      className={`w-full rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}
    >
      {/* Slides Container */}
      <div className="relative h-96 md:h-80 overflow-hidden">
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute w-full h-full transition-opacity duration-500 ${
                current === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className={`w-full h-full p-8 flex flex-col justify-center items-start ${
                  slide.bgColor || (isDark ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50')
                }`}
              >
                <div className="max-w-2xl">
                  <h3 className={`text-4xl font-bold mb-4 ${
                    slide.titleColor || (isDark ? 'text-white' : 'text-gray-900')
                  }`}>
                    {slide.title}
                  </h3>
                  <p className={`text-lg ${
                    slide.textColor || (isDark ? 'text-gray-300' : 'text-gray-700')
                  }`}>
                    {slide.description}
                  </p>
                  {slide.cta && (
                    <button
                      onClick={slide.cta.onClick}
                      className={`mt-6 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        slide.ctaStyle || 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {slide.cta.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all duration-300 ${
            isDark
              ? 'bg-gray-700/70 hover:bg-gray-600 text-white'
              : 'bg-white/70 hover:bg-white text-gray-900'
          }`}
        >
          ‹
        </button>
        <button
          onClick={nextSlide}
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all duration-300 ${
            isDark
              ? 'bg-gray-700/70 hover:bg-gray-600 text-white'
              : 'bg-white/70 hover:bg-white text-gray-900'
          }`}
        >
          ›
        </button>
      </div>

      {/* Dots Indicator */}
      <div className={`flex justify-center gap-2 py-4 ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              current === index
                ? isDark
                  ? 'bg-blue-500 w-8'
                  : 'bg-blue-600 w-8'
                : isDark
                ? 'bg-gray-600 hover:bg-gray-500'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

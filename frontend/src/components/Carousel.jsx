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
    <div className="w-full rounded-xl overflow-hidden transition-all duration-300" style={{ backgroundColor: 'var(--bg-surface)', boxShadow: 'var(--shadow)' }}>
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
              <div className="w-full h-full p-8 flex flex-col justify-center items-start" style={{ background: slide.bgColor || 'transparent' }}>
                <div className="max-w-2xl">
                  <h3 className={`text-4xl font-bold mb-4`} style={{ color: slide.titleColor || (isDark ? 'var(--bg-main)' : 'var(--text-primary)') }}>
                    {slide.title}
                  </h3>
                  <p className="text-lg" style={{ color: slide.textColor || 'var(--text-secondary)' }}>
                    {slide.description}
                  </p>
                  {slide.cta && (
                    <button
                      onClick={slide.cta.onClick}
                      className={`mt-6 px-6 py-3 rounded-lg font-semibold transition-all duration-300 btn-primary`}
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
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all duration-300" style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}>‹</button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all duration-300" style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}>›</button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 py-4" style={{ backgroundColor: 'var(--bg-main)' }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${current === index ? 'w-8' : 'w-3'}`}
            style={{ backgroundColor: current === index ? 'var(--color-brand)' : 'var(--border-color)', height: '0.75rem' }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

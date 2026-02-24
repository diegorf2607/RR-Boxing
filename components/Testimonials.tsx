'use client'

import { Star, Play } from 'lucide-react'
import { useState } from 'react'

const testimonials = [
  {
    name: 'Carlos M.',
    age: 29,
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
  },
  {
    name: 'Laura P.',
    age: 26,
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400',
  },
  {
    name: 'Diego S.',
    age: 33,
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400',
  },
]

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="card overflow-hidden p-0">
      {/* Video Container */}
      <div className="relative aspect-[3/4] bg-dark-200">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${testimonial.image}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent"></div>
        </div>

        {/* Play Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 flex items-center justify-center group"
        >
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-accent/40">
            <Play className="w-6 h-6 text-dark ml-1" fill="currentColor" />
          </div>
        </button>

        {/* Duration Badge */}
        <div className="absolute bottom-20 left-4 bg-dark/80 px-2 py-1 rounded text-sm">
          0:00
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Stars */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-accent fill-accent" />
          ))}
        </div>
        
        {/* Name & Age */}
        <p className="font-bold text-white">{testimonial.name}</p>
        <p className="text-sm text-neutral">{testimonial.age} años</p>
      </div>
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="py-12 md:py-20 bg-dark-100">
      <div className="container mx-auto px-4">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 italic">
          Lo que dicen
          <br />
          nuestros alumnos
        </h2>
        <p className="section-subtitle">
          Personas reales que han transformado su condición física con RR Boxing Academy.
        </p>

        {/* Testimonials - Horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex-shrink-0 w-[280px] md:w-auto snap-center">
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
        {/* Scroll hint for mobile */}
        <p className="text-center text-neutral text-xs mt-2 md:hidden">
          ← Desliza para ver más →
        </p>
      </div>
    </section>
  )
}

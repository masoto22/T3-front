'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import Chat from '@/components/chat'

interface Movie {
  title: string
  imagePath: string
}

const movies: Movie[] = [
  { title: "10 Things I Hate About You", imagePath: "/images/10-things-i-hate-about-you.jpg" },
  { title: "500 Days of Summer", imagePath: "/images/500-days-of-summer.jpg" },
  { title: "A Walk to Remember", imagePath: "/images/a-walk-to-remember.jpg" },
  { title: "Crazy, Stupid, Love", imagePath: "/images/crazy-stupid-love.jpg" },
  { title: "He's just not that into you", imagePath: "/images/hes-just-not-that-into-you.jpg" },
  { title: "Legally Blonde", imagePath: "/images/legally-blonde.jpg" },
  { title: "Notting Hill", imagePath: "/images/notting-hill.jpg" },
  { title: "Pretty Woman", imagePath: "/images/pretty-woman.jpg" },
  { title: "The Devil Wears Prada", imagePath: "/images/the-devil-wears-prada.jpg" },
  { title: "The Ugly Truth", imagePath: "/images/the-ugly-truth.jpg" },
]

//https://ui.shadcn.com/examples/cards
const MovieChart = ({ onSelectMovie, selectedMovie }: { onSelectMovie: (movie: Movie) => void, selectedMovie: Movie | null }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-white">Selecciona una película</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <Card key={movie.title} className="overflow-hidden" onClick={() => onSelectMovie(movie)}>
            <CardContent className="p-0">
              <div className={`relative aspect-[2/3] w-full ${selectedMovie?.title === movie.title ? 'opacity-50' : ''}`}>
                <Image
                  src={movie.imagePath}
                  alt={movie.title}
                  fill
                  className="object-cover cursor-pointer" // Añadir cursor pointer
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>
              <div className="p-2">
                <h3 className="text-sm font-medium line-clamp-2">{movie.title}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default function MovieChatPage() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  return (
    <div className="min-h-screen h-screen flex flex-col lg:flex-row bg-gray-900 overflow-hidden">
      <div className="w-full lg:w-3/5 p-4 overflow-auto">
        <MovieChart onSelectMovie={setSelectedMovie} selectedMovie={selectedMovie} />
      </div>
      <div className="w-full lg:w-2/5 p-4 h-full overflow-hidden bg-gray-900">
        <div className="h-full max-w-lg mx-auto">
          <Chat selectedMovie={selectedMovie} />
        </div>
      </div>
    </div>
  );
}
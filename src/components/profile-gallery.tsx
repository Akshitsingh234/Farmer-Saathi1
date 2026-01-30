"use client";

import Image from "next/image";

interface ProfileGalleryProps {
  gallery: string[];
}

export function ProfileGallery({ gallery }: ProfileGalleryProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {gallery.map((src, index) => (
          <div key={index} className="relative h-64 w-full">
            <Image
              src={src}
              alt={`Artwork ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

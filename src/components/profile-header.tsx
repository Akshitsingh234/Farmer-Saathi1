"use client";

import Image from "next/image";

interface ProfileHeaderProps {
  name: string;
  location: string;
  workType: string;
  profileImage: string;
}

export function ProfileHeader({ name, location, workType, profileImage }: ProfileHeaderProps) {
  return (
    <header className="flex items-center space-x-4 p-4 border-b">
      <Image
        src={profileImage}
        alt={name}
        width={150}
        height={150}
        className="rounded-full"
      />
      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="text-gray-600">{location}</p>
        <p className="text-gray-600">{workType}</p>
      </div>
    </header>
  );
}

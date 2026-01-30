"use client";

interface ProfileInfoProps {
  profile: {
    name: string;
    age: number;
    gender: string;
    bio: string;
    experience: {
      years: number;
      expertise: string;
      notableWork: string;
    };
    origin: string;
    craftDescription: string;
    achievements: string[];
    contact: {
      email: string;
      phone: string;
      social: {
        instagram: string;
        facebook: string;
      };
    };
  };
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Age:</strong> {profile.age}</p>
        <p><strong>Gender:</strong> {profile.gender}</p>
        <p><strong>Bio:</strong> {profile.bio}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Experience</h2>
        <p><strong>Years:</strong> {profile.experience.years}</p>
        <p><strong>Expertise:</strong> {profile.experience.expertise}</p>
        <p><strong>Notable Work:</strong> {profile.experience.notableWork}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Origin & Work</h2>
        <p><strong>Origin:</strong> {profile.origin}</p>
        <p><strong>Craft:</strong> {profile.craftDescription}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Achievements</h2>
        <ul className="list-disc list-inside">
          {profile.achievements.map((ach, index) => (
            <li key={index}>{ach}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Documents</h2>
        <div className="text-gray-500 italic">
            Placeholder for uploaded artisan-related documents.
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Contact Details</h2>
        <p><strong>Email:</strong> {profile.contact.email}</p>
        <p><strong>Phone:</strong> {profile.contact.phone}</p>
        <p>
          <strong>Instagram:</strong>
          <a href={`https://instagram.com/${profile.contact.social.instagram}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline ml-1">
             {profile.contact.social.instagram}
          </a>
        </p>
        <p>
          <strong>Facebook:</strong>
          <a href={`https://facebook.com/${profile.contact.social.facebook}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline ml-1">
            {profile.contact.social.facebook}
          </a>
        </p>
      </div>
    </div>
  );
}

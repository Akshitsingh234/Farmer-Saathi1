
export type Material = {
  name: string;
  quantity: number;
  unit: string;
};

export type Place = {
    name: string;
    address: string;
    lat?: number; // Make optional
    lon?: number; // Make optional
}

export type Event = {
    id?: number;
    name: string;
    date: string;
    location: string;
    link: string;
}

export type EnhancementIdea = {
    title: string;
    description: string;
    googleSearchQuery: string;
    suggestedPrice: string;
    platform: string;
    platformSearchQuery: string;
    demand: string;
    rating: number;
    reviewCount: number;
    insight: string;
    imageResults?: any[];
}

export type GrowthTip = {
    title: string;
    description: string;
}

export type Scheme = {
    name: string;
    description: string;
    link: string;
}

export type TrendingProduct = {
    name: string;
    description: string;
    googleSearchQuery: string; // Add this line
    suggestedPrice: string;
    platform: string;
    platformSearchQuery: string;
    demand: string;
    rating: number;
    reviewCount: number;
    insight: string;
    imageResults?: any[]; // Add this line
}


import { Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Reaction = {
  id: string;
  emoji: string;
  authorId: string;
};

export type Comment = {
  id: string;
  author: User;
  authorId: string;
  content: string;
  createdAt: Date | Timestamp;
};

export type StoryPost = {
  id:string;
  author: User;
  authorId: string;
  title: string;
  content: string;
  imageUrl: string;
  imageHint: string;
  createdAt: Date | Timestamp;
  commentCount: number;
};

export type Submission = {
  id: string;
  authorId: string;
  author: User;
  challengeId: string;
  challengeTitle?: string;
  imageUrl: string;
  imageHint: string;
  title: string;
  description?: string;
  createdAt: Timestamp;
  upvotes: number;
  downvotes: number;
  votes: number; // upvotes - downvotes
};

export type Vote = {
  id: string;
  userId: string;
  submissionId: string;
  challengeId: string;
  vote: 'up' | 'down';
}


export type Challenge = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  status: 'Active' | 'Past';
  // submissions are now a subcollection
  comments?: Comment[];
  createdAt?: Date | Timestamp;
  endDate?: Date | Timestamp;
  authorId?: string;
};

    

    

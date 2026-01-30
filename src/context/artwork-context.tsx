
"use client";

import { createContext, useState, ReactNode, Dispatch, SetStateAction, useContext } from 'react';
import { artworks as initialArtworks, Artwork } from '@/lib/data';

interface ArtworkContextType {
    artworks: Artwork[];
    addArtwork: (artwork: Artwork) => void;
}

export const ArtworkContext = createContext<ArtworkContextType>({
    artworks: [],
    addArtwork: () => {},
});

export const ArtworkProvider = ({ children }: { children: ReactNode }) => {
    const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);

    const addArtwork = (artwork: Artwork) => {
        setArtworks(prevArtworks => [artwork, ...prevArtworks]);
    };

    return (
        <ArtworkContext.Provider value={{ artworks, addArtwork }}>
            {children}
        </ArtworkContext.Provider>
    );
};

export const useArtworks = () => {
    const context = useContext(ArtworkContext);
    if (!context) {
        throw new Error('useArtworks must be used within an ArtworkProvider');
    }
    return context;
}

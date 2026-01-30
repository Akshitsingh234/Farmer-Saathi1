export const openInGoogleMaps = (location: string) => {
  const encodedLocation = encodeURIComponent(location);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  window.open(googleMapsUrl, '_blank');
};
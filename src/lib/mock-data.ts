import type { Event } from "./types";

export const MOCK_SUPPLIERS_FOR_SUMMARY = [
  "Artisan's Corner",
  "Craft Supplies Inc.",
  "The Material Hub",
  "City Fabric & Craft",
  "Rural Weavers Co-op",
];

export const MOCK_MATERIALS_FOR_PRICING = [
  "yarn",
  "fabric",
  "beads",
  "wood",
  "leather",
  "clay",
  "paint",
  "canvas"
];

export const mockEvents: Event[] = [
    { id: 1, name: "Spring Craft Festival", date: "May 15-17, 2024", location: "Exhibition Center", link: "#" },
    { id: 2, name: "Handmade Holiday Market", date: "November 28-30, 2024", location: "Grand Plaza", link: "#" },
    { id: 3, name: "Summer Art Walk", date: "July 10, 2024", location: "Downtown Arts District", link: "#" },
    { id: 4, name: "Pottery & Clay Expo", date: "September 5-6, 2024", location: "Convention Hall", link: "#" },
];

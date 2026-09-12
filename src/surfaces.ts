export interface SafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SurfaceProfile {
  id: string;
  name: string;
  width: number;
  height: number;
  safeArea?: SafeArea;
  minTapTarget?: number;
  minTextSize?: number;
  touchOnly?: boolean;
  viewingDistance?: "near" | "medium" | "far";
}

export const surfaces: Record<string, SurfaceProfile> = {
  mobilePortrait: {
    id: "mobilePortrait",
    name: "Mobile Interstitial (Portrait)",
    width: 320,
    height: 480,
    safeArea: { top: 20, right: 16, bottom: 20, left: 16 },
    minTapTarget: 44,
    touchOnly: true,
    viewingDistance: "near",
  },
  mobileLandscape: {
    id: "mobileLandscape",
    name: "Mobile Interstitial (Landscape)",
    width: 480,
    height: 320,
    safeArea: { top: 16, right: 30, bottom: 16, left: 30 },
    minTapTarget: 44,
    touchOnly: true,
    viewingDistance: "near",
  },
  broadcastLowerThird: {
    id: "broadcastLowerThird",
    name: "Broadcast Lower-Third",
    width: 1920,
    height: 250,
    safeArea: { top: 20, right: 100, bottom: 40, left: 100 },
    viewingDistance: "far",
    minTextSize: 32,
  },
  retailKiosk: {
    id: "retailKiosk",
    name: "Retail Kiosk (Square)",
    width: 1080,
    height: 1080,
    safeArea: { top: 60, right: 60, bottom: 60, left: 60 },
    minTapTarget: 60,
    touchOnly: true,
    viewingDistance: "medium",
    minTextSize: 24,
  },
  tinyWatch: {
    id: "tinyWatch",
    name: "Tiny Smartwatch (Constrained)",
    width: 200,
    height: 200,
    safeArea: { top: 10, right: 10, bottom: 10, left: 10 },
    minTapTarget: 40,
    touchOnly: true,
    viewingDistance: "near",
  }
};

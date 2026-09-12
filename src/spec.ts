export type ElementRole = "hero" | "primary" | "action" | "secondary" | "branding";

export interface BaseAdElement {
  id: string;
  role: ElementRole;
  priority: number; // 1 is highest priority, higher number = lower priority
}

export interface TextAdElement extends BaseAdElement {
  type: "text";
  content: string;
}

export interface ImageAdElement extends BaseAdElement {
  type: "image";
  src: string;
}

export interface ButtonAdElement extends BaseAdElement {
  type: "button";
  content: string;
}

export type AdElement = TextAdElement | ImageAdElement | ButtonAdElement;

export interface AdSpec {
  elements: AdElement[];
}

/**
 * Validates and returns the ad specification.
 */
export function defineAd(spec: AdSpec): AdSpec {
  return spec;
}

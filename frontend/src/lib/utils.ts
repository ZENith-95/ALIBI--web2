import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge class names conditionally.
 * Combines `clsx` and `tailwind-merge` for better class name handling.
 *
 * @param inputs - Class names or conditional class objects
 * @returns A single merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
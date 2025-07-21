import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isActivePath(
  path: string,
  url: string,
  strict: boolean = false
): boolean {
  if (url === "/") {
    return path === "/";
  }
  return strict ? path === url : path.startsWith(url);
}

export function getNameInitials(
  name: string,
  length: number = 1,
  uppercase: boolean = true
): string {
  const initials = name
    .split(" ")
    .map((part) => part.at(0))
    .filter(Boolean) // Remove any undefined values if only one name exists
    .slice(0, length) // Take only the first two initials
    .join("");

  return uppercase ? initials.toUpperCase() : initials;
}

export function formatDate(date: string | Date): string {
  try {
    return format(new Date(date), "MMMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}


export function debounce<F extends (...args: any[]) => void>(
  func: F,
  delay: number /* milliseconds */
): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>) => {
    // If we have a pending call, cancel it
    clearTimeout(timeoutId);

    // Schedule a fresh one
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
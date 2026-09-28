import { CardTheme } from "./CardTheme.ts";
import { PictureTheme } from "./PictureTheme.ts";
import type { Theme } from "./Theme.ts";

// themes.ts - every theme the game has, by name
//
// Record<ThemeName, Theme> is an object whose keys are exactly the ThemeNames, each holding a
// Theme - so THEMES["cards"] is a Theme, and THEMES["cars"] is a build error.

export type ThemeName = "pictures" | "cards";

export const THEMES: Record<ThemeName, Theme> = {
  pictures: new PictureTheme(),
  cards: new CardTheme(),
};

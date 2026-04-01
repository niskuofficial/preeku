import { useAppTheme } from "@/context/ThemeContext";
import colors from "@/constants/colors";

export function useColors() {
  const { resolvedTheme } = useAppTheme();
  const palette =
    resolvedTheme === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}

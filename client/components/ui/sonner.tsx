"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = (props: ToasterProps) => {
  const { theme = "system" } = useTheme()
  return <Sonner theme={theme as "light" | "dark" | "system"} {...props} />
}

export { Toaster }

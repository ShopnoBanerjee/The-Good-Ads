"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/* --------------------------------------------------------------------- */
/* Constants                                                             */
/* --------------------------------------------------------------------- */
const SIDEBAR_COOKIE_NAME       = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE    = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_WIDTH             = "16rem"
const SIDEBAR_WIDTH_MOBILE      = "18rem"
const SIDEBAR_WIDTH_ICON        = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

/* --------------------------------------------------------------------- */
/* Context & Hook                                                        */
/* --------------------------------------------------------------------- */
type SidebarContextType = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
  openMobile: boolean
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextType | null>(null)

export const useSidebar = () => {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider.")
  return ctx
}

/* --------------------------------------------------------------------- */
/* Provider                                                              */
/* --------------------------------------------------------------------- */
interface SidebarProviderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "open"> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()

    /* separate state for desktop / mobile drawer ---------------------- */
    const [openMobile, setOpenMobile] = React.useState(false)
    const [_open, _setOpen] = React.useState(defaultOpen)

    const open   = openProp ?? _open
    const setOpen = React.useCallback(
      (value: React.SetStateAction<boolean>) => {
        const next = typeof value === "function" ? (value as (prev: boolean) => boolean)(open) : value
        if (setOpenProp) setOpenProp(next)
        else _setOpen(next)

        /* persist to cookie so the preference survives a refresh ------ */
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [open, setOpenProp]
    )

    /* helpers --------------------------------------------------------- */
    const toggleSidebar = React.useCallback(
      () => (isMobile ? setOpenMobile((v) => !v) : setOpen((v) => !v)),
      [isMobile, setOpen, setOpenMobile]
    )

    /* keyboard shortcut (⌘/Ctrl+B) ----------------------------------- */
    React.useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener("keydown", handler)
      return () => window.removeEventListener("keydown", handler)
    }, [toggleSidebar])

    const state: "expanded" | "collapsed" = open ? "expanded" : "collapsed"

    const ctxVal = React.useMemo(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={ctxVal}>
        <div
          ref={ref}
          data-state={state}
          className={cn("relative flex", className)}
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

/* --------------------------------------------------------------------- */
/* Toggle Button                                                         */
/* --------------------------------------------------------------------- */
interface SidebarToggleProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean
}

const SidebarToggle = React.forwardRef<HTMLButtonElement, SidebarToggleProps>(
  ({ asChild, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()
    if (asChild) {
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Slot
                ref={ref}
                onClick={toggleSidebar}
                {...props}
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Slot>
            </TooltipTrigger>
            <TooltipContent side="right">Toggle sidebar (⌘/Ctrl+B)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              {...props}
            >
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Toggle sidebar (⌘/Ctrl+B)</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
)
SidebarToggle.displayName = "SidebarToggle"

/* --------------------------------------------------------------------- */
/* Export                                                                */
/* --------------------------------------------------------------------- */
export { SidebarProvider, SidebarToggle }

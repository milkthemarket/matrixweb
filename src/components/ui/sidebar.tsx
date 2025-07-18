
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "14rem" // 224px
const SIDEBAR_WIDTH_MOBILE = "16rem" // 256px
const SIDEBAR_WIDTH_ICON = "4rem" // 64px
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  hasMounted: boolean;
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = false, 
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
    const [openMobile, setOpenMobile] = React.useState(false)
    const [_open, _setOpen] = React.useState(defaultOpen) 
    const [hasMounted, setHasMounted] = React.useState(false);

    React.useEffect(() => {
      setHasMounted(true);
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
        ?.split("=")[1]
      if (cookieValue) { 
        _setOpen(cookieValue === "true")
      }
    }, []);


    const openForContext = openProp ?? _open;

    const setOpen = React.useCallback(
      (value: boolean | ((currentOpen: boolean) => boolean)) => {
        const newOpenValue = typeof value === "function" ? value(openForContext) : value;
        if (setOpenProp) {
            setOpenProp(newOpenValue);
        } else {
            _setOpen(newOpenValue);
        }
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${newOpenValue}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [openForContext, setOpenProp]
    );

    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((openMobileState) => !openMobileState);
      } else {
        setOpen((currentOpen) => !currentOpen);
      }
    }, [isMobile, setOpenMobile, setOpen]);


    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar();
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])


    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state: openForContext && !isMobile ? "expanded" : "collapsed",
        open: openForContext && !isMobile,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        hasMounted,
      }),
      [openForContext, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, hasMounted]
    );

    const [sidebarIconWidth, setSidebarIconWidth] = React.useState("0px"); // Start with 0 server-side

    React.useEffect(() => {
      // This ensures this value is only set on the client, after initial render
      setSidebarIconWidth(SIDEBAR_WIDTH_ICON);
    }, []);

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": sidebarIconWidth, // Use state variable
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-transparent",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none" 
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "icon", 
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, openMobile, setOpenMobile, hasMounted, state } = useSidebar();

    if (!hasMounted) {
      const initialWidth = 'var(--sidebar-width-icon)';
      return (
         <div
          className={cn("hidden md:block shrink-0 sticky self-start z-10",
                       "top-1.5 h-[calc(100vh-0.75rem)]"
          )}
          style={{ width: initialWidth }}
        />
      );
    }


    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className={cn(
              "w-[--sidebar-width] bg-transparent backdrop-blur-md p-0 text-sidebar-foreground shadow-none [&>button]:hidden",
              "!top-1.5 !h-[calc(100%-0.75rem)] !bottom-auto"
            )}
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "group hidden md:flex flex-col text-sidebar-foreground sticky self-start z-10",
          "top-0 h-screen", // Flush to top, full height
          "duration-200 transition-[width] ease-linear",
          state === 'expanded' ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-width-icon)]",
          variant === "floating" && "p-0.5",
          "border-r border-white/5", // Add the subtle white divider line here
          className
        )}
        data-state={state}
        data-collapsible={collapsible}
        data-variant={variant}
        data-side={side}
        {...props}
      >
        <div
          data-sidebar="sidebar" 
          className={cn(
            "flex h-full w-full flex-col bg-sidebar backdrop-blur-md shadow-none",
            "group-data-[state=collapsed]:items-center group-data-[state=collapsed]:justify-start group-data-[state=collapsed]:gap-2 group-data-[state=collapsed]:py-6",
            variant === "floating" && "rounded-lg",
            "p-0.5" // Removed padding
          )}
        >
          {children}
        </div>
      </div>
    );
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar() 

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6 text-foreground hover:text-primary", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar() 
      }}
      {...props}
    >
      <PanelLeft className="h-4 w-4"/>
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { isMobile } = useSidebar() 
  if (isMobile) return null; 

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar (disabled)" 
      tabIndex={-1}
      title="Sidebar (icon-only)"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-1 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-px group-data-[side=left]:-right-1 group-data-[side=right]:left-0 sm:flex",
        "cursor-default", 
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-0 flex-1 flex-col bg-transparent", 
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar(); 
  if (state === 'collapsed') return null; 

  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-7 w-full bg-background text-foreground border-input/50 shadow-none focus-visible:ring-1 focus-visible:ring-sidebar-ring",
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { state } = useSidebar();
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn(
        "flex flex-col shrink-0 items-center justify-center",
        state === 'expanded' ? 'h-24' : 'h-16', // Adjust height based on state
        className
      )}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
    const { state } = useSidebar();
    if (state === 'collapsed') return null; 
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-0.5 p-0.5", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar();
  if (state === 'collapsed') return null; 

  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-0.5 w-auto bg-sidebar-border/[.08]", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 w-full flex-col overflow-y-auto",
        state === "collapsed" ? "items-center" : "items-stretch",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-0.5", className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  const { state } = useSidebar();
  if (state === 'collapsed') return null; 

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "duration-200 flex h-7 shrink-0 items-center rounded-md px-1 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-1 [&>svg]:size-3.5 [&>svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { state, isMobile } = useSidebar();
  if (!isMobile && state === 'collapsed') return null; 

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-1 top-1 flex aspect-square w-4 items-center justify-center rounded-sm p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent/[.05] hover:text-sidebar-accent-foreground focus-visible:ring-1 [&>svg]:size-3.5 [&>svg]:shrink-0",
        "after:absolute after:-inset-1 after:md:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-xs", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => {
    const { state } = useSidebar();
    return (
        <ul
        ref={ref}
        data-sidebar="menu"
        className={cn(
            "flex w-full min-w-0 flex-col",
            state === 'collapsed' ? "items-center gap-2" : "items-stretch gap-y-1",
            className)}
        {...props}
        />
    )
})
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2.5 overflow-hidden rounded-md text-left outline-none ring-sidebar-ring transition-all hover:bg-transparent hover:text-sidebar-accent-foreground focus-visible:ring-1 active:bg-transparent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[state=open]:hover:bg-transparent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[state=collapsed]:group-data-[collapsible=icon]:!size-10 group-data-[state=collapsed]:group-data-[collapsible=icon]:!p-3 group-data-[state=collapsed]:group-data-[collapsible=icon]:justify-center [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-sidebar-foreground hover:bg-transparent hover:text-sidebar-accent-foreground",
        outline:
          "bg-transparent shadow-[0_0_0_1px_hsl(var(--sidebar-border)/0.08)] hover:bg-transparent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent)/0.5)]",
      },
      size: {
        default: "h-10 px-3 text-sm",
        sm: "h-6 text-[10px]",
        lg: "h-10 text-xs group-data-[state=collapsed]:group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state: contextState, hasMounted } = useSidebar() 

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(
          sidebarMenuButtonVariants({ variant, size }),
          isActive ? "font-bold text-white [&>svg]:text-white" : "",
          className
        )}
        {...props}
      />
    )

    if (!tooltip || !hasMounted) { 
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={contextState === "expanded"}
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { state, isMobile } = useSidebar();
  if (!isMobile && state === 'collapsed') return null; 

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-0.5 top-0.5 flex aspect-square w-4 items-center justify-center rounded-sm p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent/[.05] hover:text-sidebar-accent-foreground focus-visible:ring-1 [&>svg]:size-3.5 [&>svg]:shrink-0",
        "after:absolute after:-inset-1 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-0.5",
        "peer-data-[size=default]/menu-button:top-0.5",
        "peer-data-[size=lg]/menu-button:top-1",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { state, isMobile } = useSidebar();
    if (!isMobile && state === 'collapsed') return null; 

  return (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        "absolute right-0.5 flex h-4 min-w-4 items-center justify-center rounded-sm px-0.5 text-[10px] font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-0.5",
        "peer-data-[size=default]/menu-button:top-0.5",
        "peer-data-[size=lg]/menu-button:top-1",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])
  const { state, isMobile } = useSidebar();

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-7 flex gap-1 px-1 items-center", className)}
      {...props}
    >
      {(showIcon || (!isMobile && state === 'collapsed')) && ( 
        <Skeleton
          className="size-3.5 rounded-sm"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      { (isMobile || state === 'expanded') && 
        <Skeleton
            className="h-3.5 flex-1 max-w-[--skeleton-width]"
            data-sidebar="menu-skeleton-text"
            style={
            {
                "--skeleton-width": width,
            } as React.CSSProperties
            }
        />
      }
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul"> & { open?: boolean }
>(({ className, open, ...props }, ref) => {
  const { state } = useSidebar();
  
  if (state === 'collapsed') {
    return (
      <ul
        ref={ref}
        data-sidebar="menu-sub"
        className={cn("contents", className)}
        {...props}
      />
    );
  }

  return (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "flex min-w-0 flex-col gap-0.5",
        "ml-4 py-px pl-2 pr-1",
        open === false && "hidden",
        className
      )}
      {...props}
    />
  );
});
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  }
>(({ asChild = false, isActive, tooltip, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"
  const { state, hasMounted } = useSidebar();

  const button = (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-active={isActive}
      className={cn(
        "flex h-8 min-w-0 items-center gap-2.5 overflow-hidden rounded-md px-3 text-sm text-sidebar-foreground outline-none ring-sidebar-ring transition-all hover:bg-transparent hover:text-sidebar-accent-foreground focus-visible:ring-1 active:bg-transparent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        isActive ? "text-white [&>svg]:text-white" : "",
        state === "collapsed" && "size-10 justify-center p-3",
        className
      )}
      {...props}
    />
  );

  if (!tooltip || !hasMounted) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = { children: tooltip };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state === "expanded"}
        {...tooltip}
      />
    </Tooltip>
  );
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

// SidebarMenuSubItem is deprecated and will be removed in a future version.
const SidebarMenuSubItem = SidebarMenuItem

export { SidebarMenuSubItem }


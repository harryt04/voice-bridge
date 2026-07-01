'use client'

import { usePathname } from 'next/navigation'
import {
  Apple,
  BugIcon,
  Drum,
  Grid2x2,
  LandPlot,
  ListChecks,
  MessageSquare,
  UsersRoundIcon,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { UserMenu } from '@/components/custom/user-menu'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { ThemeSwitcher } from './custom/themeSwitcher'
import { SpeakerSelector } from './custom/speaker-selector'
import { GitHubLogoIcon, PersonIcon } from '@radix-ui/react-icons'

// Menu items.
const items = [
  {
    title: `Activities`,
    url: '/activities',
    icon: Drum,
  },
  {
    title: `Food`,
    url: '/food',
    icon: Apple,
  },
  {
    title: `People`,
    url: '/people',
    icon: UsersRoundIcon,
  },
  {
    title: `Places`,
    url: '/places',
    icon: LandPlot,
  },
  {
    title: `Vocabulary Words`,
    url: '/vocabulary',
    icon: ListChecks,
  },
]

export function AppSidebar() {
  const { setOpenMobile } = useSidebar()
  const pathname = usePathname() // Get the current route.

  return (
    <Sidebar className="bg-sidebar text-sidebar-foreground">
      {/* Light sidebar background was too similar to light content, requiring glassmorphism (.translucent-bg)
          to be readable. Dark sidebar (hsl(230 20% 16%)) creates a persistent, high-contrast visual frame
          that helps users with cognitive differences locate navigation reliably without competing with content.
          It also eliminates the need for .translucent-bg, improving maintainability. */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="my-4 font-display">
            <SidebarTrigger className="-ml-2 mr-4 p-5" />
            VoiceBridge
            <div className={cn('flex w-full flex-row justify-end gap-4')}>
              <div className="h-full w-fit pt-1.5">
                <UserMenu />
              </div>
              <ThemeSwitcher />
            </div>
          </SidebarGroupLabel>
          <SpeakerSelector />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>AAC Board</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/aac'}>
                  <Link href="/aac">
                    <Grid2x2 size={16} />
                    Symbol Board
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/aac/phrases'}>
                  <Link href="/aac/phrases">
                    <MessageSquare size={16} />
                    Quick Phrases
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-2">
              {items
                .sort((a, b) => a.title.localeCompare(b.title.toLowerCase()))
                .map((item) => {
                  const isActive = pathname === item.url // Check if the current route matches the item's URL.

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        variant={isActive ? 'outline' : 'default'}
                        className="p-6"
                      >
                        <Link
                          href={item.url}
                          onClick={() => {
                            setOpenMobile(false)
                          }}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={cn('p-4')}>
        <Button variant={'outline'} asChild>
          <Link
            href="https://github.com/harryt04/voice-bridge/issues"
            target="_blank"
          >
            <BugIcon className="mr-1" />
            Report a bug
          </Link>
        </Button>
        <Button variant={'outline'} asChild>
          <Link href="https://github.com/harryt04/voice-bridge" target="_blank">
            <GitHubLogoIcon className="mr-1" />
            View source code
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

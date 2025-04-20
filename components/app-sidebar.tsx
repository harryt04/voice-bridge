'use client'

import { usePathname } from 'next/navigation'
import {
  Apple,
  BugIcon,
  Drum,
  LandPlot,
  ListChecks,
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
import { UserButton } from '@clerk/nextjs'
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
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="my-4">
            <SidebarTrigger className="-ml-2 mr-4 p-5" />
            VoiceBridge
            <div className={cn('flex w-full flex-row justify-end gap-4')}>
              <div className="h-full w-fit pt-1.5">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonPopoverCard: { pointerEvents: 'initial' },
                    },
                  }}
                />
              </div>
              <ThemeSwitcher />
            </div>
          </SidebarGroupLabel>
          <SpeakerSelector />
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

'use client'
import { Apple, LandPlot } from 'lucide-react'
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
} from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { ThemeSwitcher } from './custom/themeSwitcher'
import { SpeakerSelector } from './custom/speaker-selector'

// Menu items.
const items = [
  {
    title: `Places`,
    url: '/places',
    icon: LandPlot,
  },
  {
    title: `Food`,
    url: '/food',
    icon: Apple,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="pt-4">
            VoiceBridge
            <div className={cn('flex w-full flex-row justify-end gap-4')}>
              <UserButton
                appearance={{
                  elements: {
                    userButtonPopoverCard: { pointerEvents: 'initial' },
                  },
                }}
              />
              <ThemeSwitcher />
            </div>
          </SidebarGroupLabel>
          <SpeakerSelector />
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={cn('p-4')}>
        <Button variant={'outline'}>
          <Link
            href="https://github.com/harryt04/VoiceBridge/issues"
            target="_blank"
          >
            Report a bug
          </Link>
        </Button>
        <Button variant={'outline'}>
          <Link href="https://github.com/harryt04/VoiceBridge" target="_blank">
            View source code
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

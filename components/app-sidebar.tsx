import { Apple, LandPlot, Music, Phone } from 'lucide-react'

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
  {
    title: `Music`,
    url: '/music',
    icon: Music,
  },
  {
    title: `Call`,
    url: '/call',
    icon: Phone,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            VoiceBridge{' '}
            <div className={cn('px-4')}>
              <UserButton />
            </div>
          </SidebarGroupLabel>
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
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  )
}

import * as React from 'react'

export function withChild<P extends object>(Part: React.ComponentType<P>) {
  return function ComposedPart({
    asChild,
    children,
    ...props
  }: Omit<P, 'children'> & { asChild?: boolean; children?: React.ReactNode }) {
    const partProps = (
      asChild
        ? { ...props, render: React.Children.only(children) }
        : { ...props, children }
    ) as P
    return <Part {...partProps} />
  }
}

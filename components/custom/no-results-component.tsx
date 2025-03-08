import { FC } from 'react'
import { Card, CardTitle, CardHeader, CardDescription } from '../ui/card'

export interface NoResultsProps {
  icon: JSX.Element
  title: string
  body: string
}

export const NoResultsComponent: FC<NoResultsProps> = ({
  icon,
  title,
  body,
}) => {
  return (
    <Card className="p-6 text-center">
      <CardHeader className="flex flex-col items-center justify-center self-center justify-self-center">
        <div className="mb-4 text-4xl">{icon}</div>
        <CardTitle>
          <h2 className="mb-2 text-xl font-semibold">{title}</h2>
        </CardTitle>
      </CardHeader>
      <CardDescription className="text-center text-sm">
        <p>{body}</p>

        <p className="pt-4">
          {`Images are included as a URL (right-click on an image in google
          images and select 'Copy Image Address', then paste it in the form.)`}
        </p>
      </CardDescription>
    </Card>
  )
}

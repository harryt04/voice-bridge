import { FC } from 'react'
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
} from '../ui/card'

export interface NoResultsProps {
  icon: JSX.Element
  title: string
  body: string[]
}

export const NoResultsComponent: FC<NoResultsProps> = ({
  icon,
  title,
  body,
}) => {
  const extraMessage = `Images are included as a URL (right-click on an image in google images and select 'Copy Image Address', then paste it in the form).`
  return (
    <Card className="p-2 text-center">
      <CardHeader className="flex flex-col items-center justify-center self-center justify-self-center">
        <div className="mb-4 text-4xl">{icon}</div>
        <CardTitle className="mb-2 text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-sm">
        {body.map((line, index) => (
          <p className="py-2" key={index}>
            {line}
          </p>
        ))}
        <p className="py-2">{extraMessage}</p>
      </CardContent>
    </Card>
  )
}

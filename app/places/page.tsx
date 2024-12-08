import { PlaceComponent } from '@/components/custom/place-component'
import { Place } from '@/models'

const places: Place[] = [
  {
    id: '1',
    name: 'Adams All Abilities Park',
    description: `This is William's favorite park to come to in Utah county! He could hang out here for HOURS!`,
    imageUrl:
      'https://i.ytimg.com/vi/pAcpEbxCCPk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDOl1u-VepMBwNvzFfimUUHJ5zarA',
  },
  {
    id: '2',
    name: 'Suncrest Park',
    description: `Not Will's favorite park, but it gets the job done when we are in a pinch and don't want to drive any further.`,
    imageUrl:
      'https://locable-assets-production.s3.amazonaws.com/uploads/resource/file/656616/suncrest_203.jpeg?timestamp=1733067996',
  },
  {
    id: '3',
    name: 'Adams All Abilities Park',
    description: `This is William's favorite park to come to in Utah county! He could hang out here for HOURS!`,
    imageUrl:
      'https://i.ytimg.com/vi/pAcpEbxCCPk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDOl1u-VepMBwNvzFfimUUHJ5zarA',
  },
  {
    id: '4',
    name: 'Suncrest Park',
    description: `Not Will's favorite park, but it gets the job done when we are in a pinch and don't want to drive any further.`,
    imageUrl:
      'https://locable-assets-production.s3.amazonaws.com/uploads/resource/file/656616/suncrest_203.jpeg?timestamp=1733067996',
  },
  {
    id: '5',
    name: 'Adams All Abilities Park',
    description: `This is William's favorite park to come to in Utah county! He could hang out here for HOURS!`,
    imageUrl:
      'https://i.ytimg.com/vi/pAcpEbxCCPk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDOl1u-VepMBwNvzFfimUUHJ5zarA',
  },
  {
    id: '6',
    name: 'Suncrest Park',
    description: `Not Will's favorite park, but it gets the job done when we are in a pinch and don't want to drive any further.`,
    imageUrl:
      'https://locable-assets-production.s3.amazonaws.com/uploads/resource/file/656616/suncrest_203.jpeg?timestamp=1733067996',
  },
]

export default function Places() {
  return (
    <div
      className={
        'flex flex-wrap justify-start gap-8 p-8' // Flex container with wrapping and spacing
      }
    >
      {places.map((place) => {
        return (
          <div
            key={place.id}
            className={`// Two columns on tablets // Three columns on desktops // One column on mobile // Optional: Limit max size per card max-w-[400px] flex-grow basis-full sm:basis-1/2 lg:basis-1/3`}
          >
            <PlaceComponent place={place}></PlaceComponent>
          </div>
        )
      })}
    </div>
  )
}

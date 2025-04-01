export type PlaceInput = {
  name: string
  speakerId: string
  description?: string
  dictationUrl?: string
  address?: string
  imageUrl?: string
  imageBase64?: string
}

export type Place = PlaceInput & {
  _id: string
  userId: string
}

export type PlaceInput = {
  name: string
  imageUrl: string
  description?: string
  dictationUrl?: string
  address?: string
}

export type Place = PlaceInput & {
  _id: string
  userId: string
}

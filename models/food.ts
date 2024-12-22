export type FoodInput = {
  name: string
  speakerId: string
  imageUrl?: string
  description?: string
  dictationUrl?: string
}

export type Food = FoodInput & {
  _id: string
  userId: string
}

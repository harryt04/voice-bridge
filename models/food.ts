export type FoodInput = {
  name: string
  imageUrl?: string
  description?: string
  dictationUrl?: string
}

export type Food = FoodInput & {
  _id: string
  userId: string
}

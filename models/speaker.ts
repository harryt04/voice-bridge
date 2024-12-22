export type SpeakerInput = {
  name: string
}

export type Speaker = SpeakerInput & {
  _id: string
  parentId: string
  villagerIds: string[]
}

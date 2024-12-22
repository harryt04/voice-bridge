export type SpeakerInput = {
  name: string
}

export type Speaker = SpeakerInput & {
  _id: string
  createdBy: string
}

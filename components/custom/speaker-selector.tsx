'use client'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select'
import { useSpeakerContext } from '@/hooks/use-speakers'
import { PencilIcon, PlusIcon, ShareIcon } from 'lucide-react'

export const SpeakerSelector = () => {
  const { speakers, selectedSpeaker, setSelectedSpeaker } = useSpeakerContext()

  const handleChildSwitch = (speakerId: string) => {
    setSelectedSpeaker(
      speakers.find((speaker) => speaker._id === speakerId) as any,
    )
  }

  const handleAddSpeaker = () => {
    console.log('Open Add Child Modal')
    // Implement modal logic here
  }

  const handleEditSpaker = () => {
    console.log('Open Add Child Modal')
    // Implement modal logic here
  }

  const handleShareSpeaker = () => {
    const magicLink = `https://voicebridge.app/share/${selectedSpeaker}?token=12345`
    console.log(`Sharing speaker profile with link: ${magicLink}`)
    // Implement sharing logic (e.g., send email or show the link in UI)
  }

  return (
    <div className="px-4 py-6">
      {/* Speaker Selector */}
      <Select
        onValueChange={handleChildSwitch}
        value={selectedSpeaker?._id || ''}
      >
        <SelectTrigger className="w-full">
          {selectedSpeaker?.name}
        </SelectTrigger>
        <SelectContent>
          {speakers.map((speaker) => (
            <SelectItem key={speaker._id} value={speaker._id}>
              {speaker.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Add and Share Buttons */}
      <div className="mt-4 flex gap-4">
        <Button onClick={handleEditSpaker}>
          <PencilIcon />
        </Button>
        <Button onClick={handleAddSpeaker}>
          <PlusIcon />
        </Button>
        <Button variant="outline" onClick={handleShareSpeaker}>
          <ShareIcon />
        </Button>
      </div>
    </div>
  )
}

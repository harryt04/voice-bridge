export function openGoogleMapsDirections(address: string) {
  if (!address) {
    console.error('Address is required to open Google Maps directions.')
    return
  }

  // Encode the address to make it URL safe
  const encodedAddress = encodeURIComponent(address)

  // Construct the Google Maps URL
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`

  // Open the URL in a new tab
  window.open(googleMapsUrl, '_blank')
}

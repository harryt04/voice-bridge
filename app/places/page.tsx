import { PlaceComponent } from '@/components/custom/place'
import { Place } from '@/models'

const places: Place[] = [
  {
    id: '1',
    name: 'Place 1',
    description: 'Place 1 description',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzsa39Ct_wlG-0JAPqMIuZOyiJisvdO_Df_Q&s',
  },
  {
    id: '2',
    name: 'Place 2',
    description: 'Place 2 description',
    imageUrl:
      'https://cdn.britannica.com/02/20302-050-C9632F53/Seto-Great-Bridge-Inland-Sea-Kojima-Honshu.jpg',
  },
]

export default function Places() {
  return places.map((place) => {
    return (
      <div key={place.id}>
        <PlaceComponent place={place}></PlaceComponent>
      </div>
    )
  })
}

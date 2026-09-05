export type CategorySlug =
  | 'relief-funds'
  | 'cancer-patients'
  | 'hurricane-victims'
  | 'hiv-aids'

export interface Category {
  slug: CategorySlug
  name: string
  emoji: string
  description: string
  causeCount: number
}

export const categories: Category[] = [
  {
    slug: 'relief-funds',
    name: 'Relief Funds',
    emoji: '🌊',
    description:
      'Emergency and general humanitarian aid for communities facing poverty, famine, earthquakes, floods, and other crises.',
    causeCount: 128,
  },
  {
    slug: 'cancer-patients',
    name: 'Cancer Patients',
    emoji: '🎗️',
    description:
      'Treatment costs, chemotherapy, palliative care, and research grants for patients who cannot afford care.',
    causeCount: 94,
  },
  {
    slug: 'hurricane-victims',
    name: 'Hurricane Victims',
    emoji: '🌀',
    description:
      'Rapid-response relief for families whose homes and communities have been devastated by hurricanes and storms.',
    causeCount: 61,
  },
  {
    slug: 'hiv-aids',
    name: 'HIV / AIDS',
    emoji: '🎀',
    description:
      'Treatment access, awareness campaigns, stigma reduction, and long-term care for those living with HIV/AIDS.',
    causeCount: 47,
  },
]

export interface Cause {
  id: string
  title: string
  organisation: string
  verified: boolean
  category: CategorySlug
  image: string
  target: number
  raised: number
  donors: number
  location: string
}

export const causes: Cause[] = [
  {
    id: 'riverdale-flood-relief',
    title: 'Emergency flood relief for Riverdale families',
    organisation: 'Global Relief Alliance',
    verified: true,
    category: 'relief-funds',
    image: 'https://picsum.photos/seed/charicall-flood/640/480',
    target: 50000,
    raised: 32450,
    donors: 412,
    location: 'Riverdale, NG',
  },
  {
    id: 'amara-chemotherapy',
    title: 'Chemotherapy support for Amara',
    organisation: 'HopeCare Foundation',
    verified: true,
    category: 'cancer-patients',
    image: 'https://picsum.photos/seed/charicall-amara/640/480',
    target: 20000,
    raised: 17800,
    donors: 265,
    location: 'Accra, GH',
  },
  {
    id: 'hurricane-dara-recovery',
    title: 'Hurricane Dara recovery fund',
    organisation: 'Coastal Relief Network',
    verified: true,
    category: 'hurricane-victims',
    image: 'https://picsum.photos/seed/charicall-hurricane/640/480',
    target: 100000,
    raised: 61200,
    donors: 890,
    location: 'Gulf Coast, US',
  },
  {
    id: 'arv-access-eastern',
    title: 'ARV access programme — eastern region',
    organisation: 'Positive Futures Initiative',
    verified: true,
    category: 'hiv-aids',
    image: 'https://picsum.photos/seed/charicall-arv/640/480',
    target: 35000,
    raised: 14200,
    donors: 198,
    location: 'Kampala, UG',
  },
  {
    id: 'rebuilding-after-quake',
    title: 'Rebuilding homes after the earthquake',
    organisation: 'ShelterNow',
    verified: true,
    category: 'relief-funds',
    image: 'https://picsum.photos/seed/charicall-quake/640/480',
    target: 75000,
    raised: 75000,
    donors: 1023,
    location: 'Antakya, TR',
  },
  {
    id: 'pediatric-cancer-ward',
    title: 'Pediatric cancer ward equipment fund',
    organisation: "Children's Hope Hospital",
    verified: true,
    category: 'cancer-patients',
    image: 'https://picsum.photos/seed/charicall-pediatric/640/480',
    target: 40000,
    raised: 9200,
    donors: 87,
    location: 'Nairobi, KE',
  },
]

export const categoryStyles: Record<
  CategorySlug,
  { bg: string; text: string; dot: string }
> = {
  'relief-funds': { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  'cancer-patients': {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    dot: 'bg-pink-500',
  },
  'hurricane-victims': {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    dot: 'bg-violet-500',
  },
  'hiv-aids': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
}

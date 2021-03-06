export interface Book {
  id: string
  ownerId: string
  title: string
  author: string
  owned: boolean
  read: boolean
  favorite: boolean
  wishlist: boolean
  date: string
  isbn?: number
  original?: string
  language?: string
  publisher?: string
  year?: number
  pages?: number
  genres?: string[]
  collections?: string[]
  tags?: string[]
  notes?: string
  imageSmall?: string
  imageLarge?: string
  rating?: number
  goodreadsId?: number
  goodreadsLink?: string
  goodreadsAuthorId?: number
}

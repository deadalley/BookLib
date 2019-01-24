import { Component, OnInit } from '@angular/core'
import { GoodreadsService } from 'services/goodreads.service'
import { LibraryService } from 'services/library.service'
import { Book } from 'models/book.model'
import { ANIMATIONS } from 'utils/constants'
import { parseBook } from 'utils/helpers'

@Component({
  moduleId: module.id,
  selector: 'goodreads-import',
  templateUrl: 'goodreads-import.component.html',
  styleUrls: ['./goodreads-import.component.css'],
  animations: [ANIMATIONS.CARD],
})
export class GoodreadsImportComponent implements OnInit {
  goodreadsId: number
  books = [] as Book[]
  isLoading = true
  hasSelectedBooks = false

  constructor(
    private goodreadsService: GoodreadsService,
    private libraryService: LibraryService
  ) {
    this.loadBooks()
  }

  ngOnInit() {}

  loadBooks() {
    this.goodreadsService.goodreadsId.subscribe(goodreadsId => {
      if (!goodreadsId) {
        return
      }
      this.goodreadsService.getBooksForUser(books => {
        if (!books || books.length === 0) {
          return
        }

        this.books = books.map(book => ({
          ...parseBook(book),
          owned: false,
          read: false,
          favorite: false,
          wishlist: false,
          date: new Date().toISOString(),
          isSelected: true,
          canBeSelected: true,
        }))

        this.libraryService.books$.subscribe(userBooks => {
          if (!userBooks) {
            return
          }

          this.isLoading = false
          this.hasSelectedBooks = true
          const grBooks = userBooks
            .filter(book => !!book.goodreadsId)
            .map(book => book.goodreadsId)
          this.books = this.books.filter(
            book => !grBooks.includes(book.goodreadsId)
          )
        })
      })
    })
  }

  updateSelectedBooks() {
    this.hasSelectedBooks = this.books.some(book => book.isSelected)
  }

  selectAll(selection: boolean) {
    this.books.forEach(book => (book.isSelected = selection))
    this.updateSelectedBooks()
  }

  importBooks() {
    this.libraryService.addBooks(this.books.filter(book => book.isSelected))
  }
}

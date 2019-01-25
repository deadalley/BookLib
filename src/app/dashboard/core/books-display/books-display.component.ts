import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Book } from 'models/book.model'
import { removeSpaces } from 'utils/helpers'
import { UiService } from 'services/ui.service'
import {
  MAX_BOOKS_DISPLAY,
  DEFAULT_TABLE_ITEMS,
  MAX_BOOKS_DISPLAY_LIST,
} from 'utils/constants'

@Component({
  moduleId: module.id,
  selector: 'books-display',
  templateUrl: 'books-display.component.html',
  styleUrls: ['books-display.component.css'],
})
export class BooksDisplayComponent implements OnInit {
  @Input() books: Book[]

  @Input() withButtons: boolean
  @Input() clickable: boolean
  @Input() linkable: boolean
  @Input() selectable: boolean

  @Input() statusIncluded: string
  @Input() statusNotIncluded: string
  @Input() statusCannotBeSelected: string
  @Input() selectBtnContent: string
  @Input() selectBtnContentDisabled: string
  @Input() tableDisplayItems = DEFAULT_TABLE_ITEMS

  @Output() selectedBooks = new EventEmitter<Book[]>()
  @Output() selectedBook = new EventEmitter<Book>()

  tilesDisplay = true
  displayAll = false
  selectedAll = false
  maxBooks = 0
  page = 1
  pageCount = 1
  removeSpaces = removeSpaces

  constructor(private uiService: UiService) {
    this.maxBooks = MAX_BOOKS_DISPLAY
    this.uiService.bookCount$.subscribe(bookCount => {
      this.pageCount = Math.ceil(bookCount / this.maxBooks)
    })
  }

  ngOnInit() {}

  selectAll() {
    this.selectedAll = !this.selectedAll
    this.books.forEach(book => (book.isSelected = this.selectedAll))
    this.selectedBooks.emit(this.books.filter(book => book.isSelected))
  }

  toggleTilesDisplay() {
    this.tilesDisplay = !this.tilesDisplay
    if (this.tilesDisplay) {
      this.maxBooks = MAX_BOOKS_DISPLAY
    } else {
      this.maxBooks = MAX_BOOKS_DISPLAY_LIST
    }
  }
}

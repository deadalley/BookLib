import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Book } from 'models/book.model'
import { LibraryService } from 'services/library.service'
import { scrollToAnchor } from 'utils/helpers'
import { UiService } from 'services/ui.service'

@Component({
  moduleId: module.id,
  selector: 'books-home',
  templateUrl: 'books-home.component.html',
  styleUrls: [],
})
export class BooksHomeComponent implements OnInit, OnDestroy, AfterViewInit {
  tilesDisplay = true
  orderingMethod: string
  allBooks: Book[]
  books: Book[]
  subscriptions = []
  tagFilter: string

  readonly PUSH_ORDERING = {
    genre: 'No genre',
  }

  constructor(
    private libraryService: LibraryService,
    private uiService: UiService,
    private route: ActivatedRoute
  ) {
    this.subscriptions.push(
      this.libraryService.books$.subscribe(books => {
        this.allBooks = books
        this.books = books
      })
    )
    this.subscriptions.push(
      this.uiService.tilesDisplay$.subscribe(
        tilesDisplay => (this.tilesDisplay = tilesDisplay)
      )
    )
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        if (!this.allBooks) {
          return
        }
        this.tagFilter = params['tag']
        this.orderingMethod = params['grouping']

        if (this.tagFilter) {
          this.books = this.allBooks.filter(
            book => book.tags && book.tags.includes(this.tagFilter)
          )
        } else {
          this.books = this.allBooks
        }
      })
    )
    this.subscriptions.push(
      this.route.fragment.subscribe(fragment => {
        if (!fragment) {
          return
        }
        scrollToAnchor(fragment, 100)
      })
    )
  }

  ngOnInit() {}

  ngAfterViewInit() {
    scrollToAnchor(this.route.snapshot.fragment, 100)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe())
  }
}
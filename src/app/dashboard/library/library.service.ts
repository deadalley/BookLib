import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { DatabaseService } from '../../../services/database.service'
import { User } from '../../../interfaces/user'
import { Book } from '../../../interfaces/book'
import { Collection } from '../../../interfaces/collection'
import * as _ from 'lodash'

@Injectable()
export class LibraryService {
  private bookOrdering = new BehaviorSubject<string>('title')
  private collectionOrdering = new BehaviorSubject<string>('title')
  private tilesDisplay = new BehaviorSubject<boolean>(true)
  private books = new BehaviorSubject<Book[]>([])
  private collections = new BehaviorSubject<Collection[]>([])
  private book = new BehaviorSubject<Book>(undefined)
  private collection = new BehaviorSubject<Collection>(undefined)

  private _owner: User

  collectionOrdering$ = this.collectionOrdering.asObservable()
  bookOrdering$ = this.bookOrdering.asObservable()
  tilesDisplay$ = this.tilesDisplay.asObservable()
  collections$ = this.collections.asObservable()
  books$ = this.books.asObservable()
  private book$ = this.book.asObservable()
  private collection$ = this.collection.asObservable()

  constructor(private database: DatabaseService) {
    this._owner = JSON.parse(localStorage.getItem('user'))
    this.loadBooks()
    this.loadCollections()
  }

  private loadBooks() {
    this.database.getBooksForUser(this._owner.ref, (books) => this.books.next(books))
  }

  private loadCollections() {
    this.database.getCollectionsForUser({
      userRef: this._owner.ref,
      userId: this._owner.id
    }, (collections) => this.collections.next(collections) )
  }

  toggleTilesDisplay(toggle: boolean) {
    this.tilesDisplay.next(toggle)
  }

  setBookOrderingMethod(method: string) {
    this.bookOrdering.next(method)
  }

  setCollectionOrderingMethod(method: string) {
    this.collectionOrdering.next(method)
  }

  addBook(book: Book) {
    this.database.postBookForUser({
      userRef: this._owner.ref,
      userId: this._owner.id
    }, book)
  }

  updateBook(book) {
    this.database.updateBookForUser({
      userRef: this._owner.ref,
      userId: this._owner.id
    }, book)
  }

  addCollection(collection: Collection) {
    this.database.postCollectionForUser(this._owner.ref, {
      owner: this._owner.id,
      title: collection.title,
      books: collection.books.map((book) => book.id),
      description: collection.description
    })
  }

  findBook(id: string) {
    this.database.findBookById({ userRef: this._owner.ref, bookId: id}, (book) => this.book.next(book))
    return this.book$
  }

  deleteBook(book: Book) {
    this.database.deleteBook({
      userRef: this._owner.ref,
      userId: this._owner.id
    }, book)
  }

  findCollection(id: string) {
    this.database.findCollectionById(id, (collection) => this.collection.next(collection))
    return this.collection$
  }

  updateCollection(collection) {
    this.database.updateCollection(collection)
  }
}

import { TestBed, inject } from '@angular/core/testing'
import { APP_BASE_HREF } from '@angular/common'
import { RouterModule } from '@angular/router'
import { AngularFireModule } from 'angularfire2'
import { AngularFireDatabaseModule } from 'angularfire2/database'
import { AngularFireAuthModule } from 'angularfire2/auth'
import { environment } from 'environments/environment'
import { AppRoutes } from '../app/app.routing'

import { AuthService } from './auth.service'
import { SessionService } from './session.service'
import { DatabaseService } from './database.service'

import { Book } from '../database/models/book.model'
import { Collection } from '../database/models/collection.model'

import UserFactory from '../database/factories/user.factory'
import BookFactory from '../database/factories/book.factory'
import CollectionFactory from '../database/factories/collection.factory'

describe('DatabaseService', () => {
  let database: DatabaseService
  let auth: AuthService

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        AuthService,
        SessionService,
        DatabaseService,
      ],
      imports: [
        RouterModule.forRoot(AppRoutes),
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireDatabaseModule,
        AngularFireAuthModule,
      ],
    })

    database = TestBed.get(DatabaseService)
    auth = TestBed.get(AuthService)
    await auth.loginEmail(environment.testConfig)
  })

  afterAll(() => {
    database.cleanTestBed()
    auth.logout()
    localStorage.clear()
  })

  let user = UserFactory.build()
  let book = BookFactory.build()
  let collection = CollectionFactory.build()

  const createBook = (ownerId, { collections = [] } = {}) => {
    const newBook = BookFactory.build({
      ownerId,
      collections,
    })
    return database.createBookForUser(ownerId, newBook)
  }

  const createCollection = (ownerId, { books = [] } = {}) => {
    const newCollection = CollectionFactory.build({
      ownerId,
      books,
    })
    return database.createCollectionForUser(ownerId, newCollection)
  }

  const createBooksForUser = ownerId => {
    const newBook = BookFactory.build()
    return Promise.all([
      database.createBookForUser(ownerId, newBook),
      database.createBookForUser(ownerId, newBook),
      database.createBookForUser(ownerId, newBook),
    ])
  }

  it('should be created', inject(
    [DatabaseService],
    (service: DatabaseService) => {
      expect(service).toBeTruthy()
    }
  ))

  describe('User', () => {
    let user = UserFactory.build()

    beforeEach(async () => {
      user = await database.createUser(user)
    })

    it('creates a user', done => {
      database.createUser(user)

      database.users.valueChanges().subscribe(value => {
        const lastIndex = value.length - 1
        expect(value[lastIndex].name).toEqual(user.name)
        expect(value[lastIndex].email).toEqual(user.email)
        expect(value[lastIndex].uid).toEqual(user.uid)
        expect(value[lastIndex].goodreadsId).toEqual(user.goodreadsId)
        done()
      })
    })

    it('finds user by id', done => {
      database.findUserById(user.id).then(value => {
        expect(value.id).toEqual(user.id)
        expect(value.name).toEqual(user.name)
        expect(value.email).toEqual(user.email)
        done()
      })
    })

    it('finds user by name', done => {
      database.findUserByParam('name', user.name).then(value => {
        expect(value.name).toEqual(user.name)
        done()
      })
    })

    it('updates the user', done => {
      const updateParams = { name: 'A new name', email: 'email@test.com' }
      database.updateUser(user.id, updateParams).then(value => {
        expect(value.name).toEqual(updateParams.name)
        expect(value.email).toEqual(updateParams.email)
        done()
      })
    })
  })

  describe('Book', () => {
    beforeEach(async () => {
      user = await database.createUser(user)
      book = await database.createBookForUser(user.id, book)
      collection = await database.createCollectionForUser(user.id, collection)
    })

    it('creates a book for a user', done => {
      createBook(user.id, { collections: [collection.id] }).then(value => {
        expect(value.title).toEqual(book.title)
        expect(value.ownerId).toEqual(book.ownerId)
        expect(value.collections).toContain(collection.id)

        return database
          .findCollectionById(collection.id)
          .then(collectionForBook => {
            expect(collectionForBook.books).toContain(value.id)
            done()
          })
      })
    })

    it('finds a book by id', done => {
      database.findBookById(book.id).then(value => {
        expect(value.id).toEqual(book.id)
        expect(value.title).toEqual(book.title)
        expect(value.ownerId).toEqual(book.ownerId)
        expect(value.collections).toEqual(book.collections)
        done()
      })
    })

    it('get books for user', done => {
      createBooksForUser(user.id).then(books => {
        books.push(book)
        database.getBooksForUser(user.id).then(value => {
          expect(value.length).toEqual(books.length)
          books.forEach(book => expect(value).toContain(book))
          done()
        })
      })
    })

    it('get books for collection', done => {
      createBooksForUser(user.id).then(books => {
        const bookIds = books.map(book => book.id)
        createCollection(user.id, { books: bookIds }).then(newCollection => {
          database
            .addCollectionsToBooks(bookIds, [newCollection.id])
            .then(() => {
              database
                .getBooksForCollection(newCollection.id, user.id)
                .then(value => {
                  expect(value.length).toEqual(books.length)
                  value.forEach(bookFromDb =>
                    expect(bookIds).toContain(bookFromDb.id)
                  )
                  done()
                })
            })
        })
      })
    })

    it('update book', done => {
      const updateParams = {
        title: 'A new title',
        publisher: 'Not a publisher',
        genres: [],
        language: '',
        collections: [collection.id],
      }

      database
        .updateBookForUser(user.id, { ...book, ...updateParams } as Book)
        .then(() => {
          Promise.all([
            database.findBookById(book.id).then(value => {
              expect(value.title).toEqual(updateParams.title)
              expect(value.publisher).toEqual(updateParams.publisher)
              expect(value.language).toEqual(updateParams.language)
              expect(value.genres).toEqual(updateParams.genres)
              expect(value.collections).toContain(collection.id)
            }),
            database
              .findCollectionById(collection.id)
              .then(value => {
                expect(value.books).toContain(book.id)
              })
              .then(() => done()),
          ])
        })
    })

    it('delete book', done => {
      createBook(user.id, { collections: [collection.id] }).then(bookFromDb => {
        database.deleteBookForUser(user.id, bookFromDb as Book).then(() => {
          Promise.all([
            database.findBookById(bookFromDb.id).then(value => {
              expect(value).toBeNull()
            }),
            database.findCollectionById(collection.id).then(value => {
              expect(value.books).not.toContain(bookFromDb.id)
            }),
            database.findUserById(user.id).then(value => {
              expect(value.books).not.toContain(bookFromDb.id)
            }),
          ]).then(() => done())
        })
      })
    })
  })

  describe('Collection', () => {
    beforeEach(async () => {
      user = await database.createUser(user)
      book = await database.createBookForUser(user.id, book)
      collection = await database.createCollectionForUser(user.id, collection)
    })

    it('adds books to collection', done => {
      createBooksForUser(user.id).then(books => {
        database
          .addBooksToCollection(collection.id, books.map(book => book.id))
          .then(bookIds => {
            database.findCollectionById(collection.id).then(value => {
              expect(value.books).toContain(bookIds[0])
              expect(value.books).toContain(bookIds[1])
              expect(value.books).toContain(bookIds[2])
              done()
            })
          })
      })
    })

    it('add collections to book', done => {
      createBook(user.id, { collections: [collection.id] }).then(book => {
        database
          .addCollectionsToBook(book.id, [collection.id])
          .then(collectionIds => {
            database.findBookById(book.id).then(value => {
              expect(value.collections).toContain(collectionIds[0])
              done()
            })
          })
      })
    })

    it('removes books from collection', done => {
      createBooksForUser(user.id).then(books => {
        createCollection(user.id, { books: books.map(book => book.id) }).then(
          collection => {
            database
              .removeBooksFromCollection(collection.id, [
                books[0].id,
                books[1].id,
              ])
              .then(bookIds => {
                database.findCollectionById(collection.id).then(value => {
                  bookIds.forEach(bookId =>
                    expect(value.books).not.toContain(bookId)
                  )
                  expect(value.books).toContain(books[2].id)
                  done()
                })
              })
          }
        )
      })
    })

    it('removes collections from book', done => {
      createBook(user.id, { collections: [collection.id] }).then(newBook => {
        database
          .removeCollectionsFromBook(newBook.id, [collection.id])
          .then(collectionIds => {
            database.findBookById(newBook.id).then(value => {
              collectionIds.forEach(collectionId =>
                expect(value.collections).not.toContain(collectionId)
              )
              done()
            })
          })
      })
    })

    it('creates a collection for a user', done => {
      createBooksForUser(user.id).then(books => {
        const bookIds = books.map(book => book.id)
        createCollection(user.id, { books: bookIds }).then(value => {
          expect(value.title).toEqual(collection.title)
          expect(value.description).toEqual(collection.description)
          expect(value.ownerId).toEqual(collection.ownerId)
          expect(value.books).toEqual(bookIds)

          database
            .getBooksForCollection(value.id, user.id)
            .then(booksFromDb => {
              expect(booksFromDb.length).toEqual(bookIds.length)
              booksFromDb.forEach(book =>
                expect(book.collections).toContain(value.id)
              )
              done()
            })
        })
      })
    })

    it('find a collection by id', done => {
      database.findCollectionById(collection.id).then(value => {
        expect(value.id).toEqual(collection.id)
        expect(value.title).toEqual(collection.title)
        expect(value.ownerId).toEqual(collection.ownerId)
        expect(value.books).toEqual(collection.books)
        done()
      })
    })

    it('get collections for user', done => {
      database.getCollectionsForUser(user.id).then(value => {
        expect(value.length).toEqual(1)
        expect(value).toContain(collection)
        done()
      })
    })

    it('update collection', done => {
      const updateParams = {
        title: 'A new title',
        description: 'A new description',
        books: [book.id],
      }

      database
        .updateCollectionForUser(user.id, { ...collection, ...updateParams })
        .then(() => {
          Promise.all([
            database.findCollectionById(collection.id).then(value => {
              expect(value.title).toEqual(updateParams.title)
              expect(value.description).toEqual(updateParams.description)
              expect(value.books).toContain(book.id)
            }),
            database.findBookById(book.id).then(value => {
              expect(value.collections).toContain(collection.id)
            }),
          ]).then(() => done())
        })
    })

    it('delete collection', done => {
      createCollection(user.id, { books: [book.id] }).then(collectionFromDb => {
        database
          .deleteCollectionForUser(user.id, collectionFromDb as Collection)
          .then(() => {
            Promise.all([
              database.findCollectionById(collectionFromDb.id).then(value => {
                expect(value).toBeNull()
              }),
              database.findBookById(book.id).then(value => {
                expect(value.collections).not.toContain(collectionFromDb.id)
              }),
              database.findUserById(user.id).then(value => {
                expect(value.collections).not.toContain(collectionFromDb.id)
              }),
            ]).then(() => done())
          })
      })
    })
  })
})
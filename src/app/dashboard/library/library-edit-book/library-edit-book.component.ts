import { Component, OnInit, Output, ViewChild, EventEmitter, trigger, transition, style, animate, group, state, OnDestroy } from '@angular/core'
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Location } from '@angular/common'
import { random } from 'faker'
import { BookButtonsComponent } from '../../core/book-buttons/book-buttons.component'
import { Collection } from '../../../../interfaces/collection'
import { Book } from '../../../../interfaces/book'
import Languages from '../../../../utils/languages'
import { cleanFormValues } from '../../../../utils/helpers'
import { LibraryService } from '../library.service'
import { Router, ActivatedRoute } from '@angular/router'

@Component({
  moduleId: module.id,
  selector: 'library-edit-book',
  templateUrl: 'library-edit-book.component.html',
  styleUrls: ['./library-edit-book.component.css'],
  animations: [
    trigger('cardaddbook', [
      state('*', style({
        '-ms-transform': 'translate3D(0px, 0px, 0px)',
        '-webkit-transform': 'translate3D(0px, 0px, 0px)',
        '-moz-transform': 'translate3D(0px, 0px, 0px)',
        '-o-transform': 'translate3D(0px, 0px, 0px)',
        transform: 'translate3D(0px, 0px, 0px)',
        opacity: 1})),
        transition('void => *', [
          style({opacity: 0,
            '-ms-transform': 'translate3D(0px, 150px, 0px)',
            '-webkit-transform': 'translate3D(0px, 150px, 0px)',
            '-moz-transform': 'translate3D(0px, 150px, 0px)',
            '-o-transform': 'translate3D(0px, 150px, 0px)',
            transform: 'translate3D(0px, 150px, 0px)',
          }),
          animate('0.3s 0s ease-out')
        ])
    ])
  ]
})

export class LibraryEditBookComponent implements OnInit, OnDestroy {
  form: FormGroup
  allCollections: string[]
  collections: string[]
  languages: string[]
  genres: string[]
  tags: string[]
  selectedLanguage: string
  book = { } as Book
  title = 'Edit book'
  description = 'Edit book'
  button = 'Update book'
  fromGoodreads = false
  showImage = true
  isLoading = true
  subscription

  @ViewChild(BookButtonsComponent)
  buttonsComponent: BookButtonsComponent

  get bookId(): string {
    const splitUrl = this.router.url.split('/')
    return splitUrl[splitUrl.length - 2]
  }

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private libraryService: LibraryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      original: '',
      author: ['', Validators.required],
      publisher: '',
      year: [0, Validators.min(0)],
      pages: [0, Validators.min(0)],
      notes: '',
      image_large: '',
      image_small: '',
      rating: 0
    })

    this.subscription = this.libraryService.findBook(this.bookId).subscribe((book) => {
      if (!book) { return }
      this.book = book
      this.collections = this.book.collections ? this.book.collections : []
      this.libraryService.collections$.subscribe((collections) => {
        if (!collections) { return }
        this.isLoading = false
        this.allCollections = collections
                                .filter((collection) => !this.collections.includes(collection.title))
                                .map((collection) => collection.title)
      }).unsubscribe()

      this.form.patchValue({
        title: this.book.title,
        original: this.book.original,
        author: this.book.author,
        publisher: this.book.publisher,
        year: this.book.year,
        pages: this.book.pages,
        notes: this.book.notes,
        image_large: this.book.image_large,
        image_small: this.book.image_small,
        rating: this.book.rating
      })

      this.languages = Languages
      this.genres = this.book.genres ? this.book.genres : []
      this.tags = this.book.tags ? this.book.tags : []
      this.selectedLanguage = this.book.language ? this.book.language : 'Select a language'
    })
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  submit(formValues) {
    const newValues = {
      genres: this.genres,
      tags: this.tags,
      collections: this.collections,
      ...(this.selectedLanguage !== 'Select a language') && { language: this.selectedLanguage },
      ...cleanFormValues(formValues),
      ...this.buttonsComponent.getValues()
    }

    Object.assign(this.book, newValues)

    console.log('Updating book', this.book)

    this.libraryService.updateBook(this.book)
    this.router.navigate(['../../'], { relativeTo: this.route })
  }

  getGenres(genres: Array<string>) {
    this.genres = genres
  }

  getTags(tags: Array<string>) {
    this.tags = tags
  }

  moveCollection(origin, target, index) {
    const collection = origin.splice(index, 1)[0]
    target.push(collection)

    this.allCollections.sort((a, b) => {
      if (a < b) { return -1 }
      if (a > b) { return 1 }
      return 0
    })
  }
}

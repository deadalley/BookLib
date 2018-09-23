import { Component, OnInit, ViewChild } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { BookButtonsComponent } from '../../../core/book-buttons/book-buttons.component'
import { Book } from 'interfaces/book'
import { LibraryService } from 'services/library.service'
import { AuthService } from 'services/auth.service'
import { cleanFormValues } from 'utils/helpers'

@Component({
  moduleId: module.id,
  selector: 'library-no-books',
  templateUrl: 'library-no-books.component.html',
  styleUrls: ['library-no-books.component.css']
})

export class LibraryNoBooksComponent implements OnInit {
  form: FormGroup
  genres: string[]
  tags: string[]
  selectedLanguage: string
  book = { } as Book

  @ViewChild(BookButtonsComponent)
  buttonsComponent: BookButtonsComponent

  constructor(
    private fb: FormBuilder,
    private libraryService: LibraryService,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      original: '',
      author: ['', Validators.required],
      publisher: '',
      year: 0,
      pages: 0,
      notes: '',
      rating: 0
    })
  }

  ngOnInit() {
    this.genres = []
    this.selectedLanguage = 'Select a language'
  }

  getGenres(genres: Array<string>) {
    this.genres = genres
  }

  submit(values) {
    const newValues = {
      date: new Date().toISOString().substring(0, 10),
      ...cleanFormValues(values),
      ...this.buttonsComponent.getValues()
    }

    Object.assign(this.book, newValues)

    console.log('Adding book', this.book)
    this.libraryService.addBook(this.book)
  }

  loginGoodreads() {
    this.authService.goodreadsId.subscribe((goodreadsId) => {
      if (goodreadsId) {
        this.router.navigate(['dashboard/goodreads/import'])
      } else {
        this.authService.loginGoodreads('dashboard/goodreads_login/import')
      }
    })
  }
}

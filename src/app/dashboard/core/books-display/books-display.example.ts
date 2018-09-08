import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { storiesOf, moduleMetadata } from '@storybook/angular'
import { GridComponent } from '../grid/grid.component'
import { BookCardComponent } from '../book-card/book-card.component'
import { BooksSectionComponent } from '../books-section/books-section.component'
import { BooksTableComponent } from '../books-table/books-table.component'
import { BooksDisplayComponent } from './books-display.component'
import BookFactory from 'factories/book'

const books = BookFactory.buildList(8, { canBeSelected: true, isSelected: true })
const bookInLibrary = BookFactory.build({ canBeSelected: false, isSelected: false })

storiesOf('Books Display', module)
  .addDecorator(
    moduleMetadata({
      imports: [
        CommonModule,
        RouterModule,
        TooltipModule.forRoot(),
        BrowserAnimationsModule
      ],
      declarations: [
        GridComponent,
        BookCardComponent,
        BooksSectionComponent,
        BooksTableComponent
      ]
    })
  )
  .add('default', () => ({
    component: BooksDisplayComponent,
    props: {
      books,
      sectionTitle: 'Section title',
      description: 'A description',
      withButtons: true
    },
  }))
  .add('selectable', () => ({
    component: BooksDisplayComponent,
    props: {
      books: [...books, bookInLibrary],
      sectionTitle: 'Section title',
      description: 'A description',
      withButtons: true,
      selectable: true,
      statusIncluded: 'In library',
      statusNotIncluded: 'Not in library',
      statusCannotBeSelected: 'Already in library',
      selectBtnContent: 'Add to library',
      selectBtnContentDisabled: 'Already in library'
    },
  }))
  .add('clickable', () => ({
    component: BooksDisplayComponent,
    props: {
      books,
      sectionTitle: 'Section title',
      description: 'A description',
      withButtons: true,
      clickable: true,
    },
  }))

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RatingModule } from 'ngx-bootstrap/rating'
import { TooltipModule } from 'ngx-bootstrap/tooltip'

import { CoreModule } from '../core/core.module'

import { LibraryComponent } from './library.component'
import { LibraryAddBookComponent } from './library-edit-book/library-add-book.component'
import { LibraryEditBookComponent } from './library-edit-book/library-edit-book.component'
import { LibraryAddCollectionComponent } from './library-edit-collection/library-add-collection.component'
import { LibraryEditCollectionComponent } from './library-edit-collection/library-edit-collection.component'
import { LibraryBookComponent } from './library-book/library-book.component'
import { LibraryAuthorComponent } from './library-author/library-author.component'
import { LibraryFindAuthorComponent } from './library-find-author/library-find-author.component'

import { TruncatePipe } from 'pipes/truncate.pipe'

const libraryRoutes: Routes = [
  { path: '', component: LibraryComponent, children: [
    { path: '', loadChildren: './library-home/library-home.module#LibraryHomeModule' },
    { path: 'collections/new', component: LibraryAddCollectionComponent, pathMatch: 'full' },
    { path: 'collections/:id/edit', component: LibraryEditCollectionComponent, pathMatch: 'full' },
    { path: 'books/new', component: LibraryAddBookComponent, pathMatch: 'full' },
    { path: 'books/:id', component: LibraryBookComponent },
    { path: 'books/:id/edit', component: LibraryEditBookComponent },
    { path: 'books/collections/new', redirectTo: 'collections/new' },
    { path: 'authors/:id', component: LibraryAuthorComponent },
    { path: 'authors/find/:name', component: LibraryFindAuthorComponent },
    // { path: '**', redirectTo: '', pathMatch: 'full' }
  ]}
]

@NgModule({
  imports: [
    RouterModule.forChild(libraryRoutes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RatingModule.forRoot(),
    TooltipModule.forRoot(),
    CoreModule
  ],
  declarations: [
    LibraryComponent,
    LibraryAddBookComponent,
    LibraryEditBookComponent,
    LibraryAddCollectionComponent,
    LibraryEditCollectionComponent,
    LibraryBookComponent,
    LibraryAuthorComponent,
    LibraryFindAuthorComponent,
    TruncatePipe
  ],
  exports: [ LibraryComponent ],
})

export class LibraryModule { }

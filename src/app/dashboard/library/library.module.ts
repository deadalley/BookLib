import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes, Route } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TooltipModule } from 'ngx-tooltip'
import { RatingModule } from 'ngx-rating'

import { CoreModule } from '../core/core.module'

import { LibraryComponent } from './library.component'
import { LibraryAddBookComponent } from './library-edit-book/library-add-book.component'
import { LibraryEditBookComponent } from './library-edit-book/library-edit-book.component'
import { LibraryAddCollectionComponent } from './library-edit-collection/library-add-collection.component'
import { LibraryEditCollectionComponent } from './library-edit-collection/library-edit-collection.component'
import { LibraryBookComponent } from './library-book/library-book.component'

import { LibraryService } from './library.service'

const libraryRoutes: Routes = [
  { path: '', component: LibraryComponent, children: [
    { path: '', loadChildren: './library-home/library-home.module#LibraryHomeModule' },
    { path: 'collections/new', component: LibraryAddCollectionComponent, pathMatch: 'full' },
    { path: 'collections/:id/edit', component: LibraryEditCollectionComponent, pathMatch: 'full' },
    { path: 'books/new', component: LibraryAddBookComponent, pathMatch: 'full' },
    { path: 'books/:id', component: LibraryBookComponent },
    { path: 'books/:id/edit', component: LibraryEditBookComponent },
    // { path: '**', redirectTo: '', pathMatch: 'full' }
  ]}
]

@NgModule({
  imports: [
    RouterModule.forChild(libraryRoutes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    RatingModule,
    CoreModule
  ],
  declarations: [
    LibraryComponent,
    LibraryAddBookComponent,
    LibraryEditBookComponent,
    LibraryAddCollectionComponent,
    LibraryEditCollectionComponent,
    LibraryBookComponent
  ],
  providers: [
    LibraryService
  ],
  exports: [ LibraryComponent ],
})

export class LibraryModule { }

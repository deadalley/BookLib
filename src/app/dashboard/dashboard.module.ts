import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { CoreModule } from './core/core.module'
import { SidebarModule } from './sidebar/sidebar.module'
import { FooterModule } from './shared/footer/footer.module'
import { NavbarModule } from './shared/navbar/navbar.module'
import { DashboardHomeModule } from './dashboard-home/dashboard-home.module'
import { GoodreadsModule } from './goodreads/goodreads.module'

import { DashboardComponent } from './dashboard.component'
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component'
import { ImportComponent } from './import/import.component'
import { GoodreadsComponent } from './goodreads/goodreads.component'

const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'goodreads_login', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'goodreads_login/import',
        redirectTo: 'goodreads/import',
        pathMatch: 'full',
      },
      { path: 'home', component: DashboardHomeComponent },
      { path: 'books', loadChildren: './books/books.module#BooksModule' },
      {
        path: 'collections',
        loadChildren: './collections/collections.module#CollectionsModule',
      },
      {
        path: 'authors',
        loadChildren: './authors/authors.module#AuthorsModule',
      },
      {
        path: 'goodreads',
        component: GoodreadsComponent,
        // loadChildren: './goodreads/goodreads.module#GoodreadsModule',
      },
      {
        path: 'import',
        component: ImportComponent,
      },
      {
        path: 'profile',
        loadChildren: './profile/profile.module#ProfileModule',
      },
    ],
  },
]

@NgModule({
  declarations: [DashboardComponent, ImportComponent],
  imports: [
    RouterModule.forChild(dashboardRoutes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    SidebarModule,
    NavbarModule,
    FooterModule,
    DashboardHomeModule,
    GoodreadsModule,
  ],
  exports: [DashboardComponent],
})
export class DashboardModule {}

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { HomeComponent } from './home.component'
import { SignUpComponent } from './sign-up/sign-up.component'
import { SignInComponent } from './sign-in/sign-in.component'

const homeRoutes: Routes = [
  { path: '', component: HomeComponent }
]

@NgModule({
  imports: [
    RouterModule.forChild(homeRoutes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    HomeComponent,
    SignUpComponent,
    SignInComponent
  ],
  exports: [ HomeComponent ],
})

export class HomeModule { }
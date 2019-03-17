import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'home-navbar',
  templateUrl: './home-navbar.component.html',
  styleUrls: ['./home-navbar.component.css'],
})
export class HomeNavbarComponent implements OnInit {
  showSignUp = false
  showSignIn = false

  constructor() {}

  ngOnInit() {}
}

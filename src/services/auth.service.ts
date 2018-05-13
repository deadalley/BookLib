import { Injectable } from '@angular/core'
import { AngularFireAuth } from 'angularfire2/auth'
import { AngularFireDatabase } from 'angularfire2/database'
import { Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import * as firebase from 'firebase/app'
import { DatabaseService } from './database.service'
import { User as LocalUser } from '../interfaces/user'
import { User as DBUser } from '../models/user'

@Injectable()
export class AuthService {
  private _userRef = new BehaviorSubject<string>(undefined)

  userRef = this._userRef.asObservable()

  constructor (
    public fireAuth: AngularFireAuth,
    private fireDb: AngularFireDatabase,
    private router: Router,
    private database: DatabaseService
  ) { }

  private createUserInDatabase(user) {
    this.database.findUserById(user.uid, (_user) => {
      if (_user === null) {
        console.log('user does not exist.')
        console.log(_user)

        _user = {
          name: user.displayName,
          id: user.uid,
          email: user.email
        } as DBUser

        this.database.postUser(_user).then((res) => {
          localStorage.setItem('user', JSON.stringify({ ...(_user), ref: res.ref.key }))
        })
        this._userRef.next(_user.ref)

        this.router.navigate(['library'])
      } else {
        const _ref = Object.keys(_user)[0]
        _user = {
          ...(_user[_ref]),
          ref: _ref
        } as LocalUser

        localStorage.setItem('user', JSON.stringify(_user))
        this._userRef.next(_user.ref)
        this.router.navigate(['library'])
      }
    })
  }

  private processResponse(response) {
    console.log('Successfully logged in')
    localStorage.setItem('userLoginCredentials', JSON.stringify(response.user))

    console.log()
    this.createUserInDatabase(response.user)
  }

  loginGoogle() {
    this.fireAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider)
      .then((response) => {
        this.processResponse(response)
      })
      .catch((error) => {
        console.log('Could not login')
        console.log(error)
      })
  }

  loginFacebook() {
    this.fireAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider)
      .then((response) => {
        this.processResponse(response)
      })
      .catch((error) => {
        console.log('Could not login')
        console.log(error)
      })
  }

  loginEmail({ email, password}, onError) {
    this.fireAuth.auth.signInWithEmailAndPassword(email, password)
      .then((response) => {
        console.log('Successfully logged in')
        localStorage.setItem('userLoginCredentials', JSON.stringify(response))

        this.database.findUserById(response.uid, (_user) => {
          const _ref = Object.keys(_user)[0]
          _user = {
            ...(_user[_ref]),
            ref: _ref
          } as LocalUser

          localStorage.setItem('user', JSON.stringify(_user))
          this._userRef.next(_user.ref)
          this.router.navigate(['library'])
        })

      })
      .catch((error) => {
        console.log('Could not login with e-mail and password')
        console.log(error.code, error.message)
        onError(error)
      })
  }

  signUpWithEmail({ email, password, name }) {
    this.fireAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((response) => {
        console.log('Successfully signed up')
        localStorage.setItem('userLoginCredentials', JSON.stringify(response))

        this.createUserInDatabase({ ...(response), displayName: name })

        this.router.navigate(['library'])
      })
      .catch((error) => {
        console.log('Could not sign up with e-mail and password')
        console.log(error.code, error.message)
      })
  }

  logout() {
    this.database.isLoggedIn$.next(false)
    this.fireAuth.auth.signOut()
      .then((response) => {
        console.log('Sucessefully signed out')

        localStorage.removeItem('userLoginCredentials')
        localStorage.removeItem('user')

        this.router.navigate(['home'])
      })
      .catch((error) => {
        console.log('Could not sign out')
        console.log(error.code, error.message)
      })
  }
}

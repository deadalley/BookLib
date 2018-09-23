import { Injectable } from '@angular/core'
import { AngularFireAuth } from 'angularfire2/auth'
import { AngularFireDatabase } from 'angularfire2/database'
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import * as firebase from 'firebase/app'
import * as auth0 from 'auth0-js'
import { DatabaseService } from './database.service'
import { User as LocalUser } from '../interfaces/user'
import { User as DBUser } from '../models/user'
import { environment } from 'environments/environment'

@Injectable()
export class AuthService {
  private readonly localDomain = environment.localDomain
  private readonly clientID = environment.auth0Config.clientId
  private readonly clientSecret = environment.auth0Config.clientSecret
  private readonly domain = environment.auth0Config.domain
  private readonly redirectURI = environment.auth0Config.redirectUri
  private readonly defaultParams = {
    clientID: this.clientID,
    domain: this.domain,
    responseType: 'token id_token',
    audience: `https://${this.domain}/userinfo`,
    redirectUri: this.redirectURI,
    scope: 'openid'
  }

  private auth0 = new auth0.WebAuth(this.defaultParams)

  private _userRef = new BehaviorSubject<string>(undefined)
  private _goodreadsId = new BehaviorSubject<string>(undefined)

  userRef = this._userRef.asObservable()
  goodreadsId = this._goodreadsId.asObservable()

  constructor (
    public fireAuth: AngularFireAuth,
    private fireDb: AngularFireDatabase,
    private router: Router,
    private http: HttpClient,
    private database: DatabaseService
  ) {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      this._userRef.next(user.ref)
      this._goodreadsId.next(user.goodreadsId)
    }
    this.setupSessionForGoodreadsLogin()
  }

  private setupSessionForGoodreadsLogin() {
    this.auth0.parseHash((error, result) => {
      if (result && result.accessToken && result.idToken) {
        window.location.hash = ''

        this.auth0.client.userInfo(result.accessToken, (err, user) => {
          const goodreadsId = user.sub.split('|')[2]
          const localUser = JSON.parse(localStorage.getItem('user'))

          localStorage.setItem('user', JSON.stringify({ ...(localUser), goodreadsId: goodreadsId }))
          this._goodreadsId.next(goodreadsId)

          this.database.updateUser(localUser.id, { goodreadsId: goodreadsId })
        })
      } else if (error) {
        console.log('Could not log in on Goodreads')
        console.log(error)
      }
    })
  }

  private createUserInDatabase(user, params: object = {}) {
    return this.database.findUserById(user.uid).then((_user) => {
      if (_user === null) {
        console.log('User does not exist')

        _user = {
          name: user.displayName || params['displayName'],
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
      }
    })
  }

  private processResponse(user: object, params: object = {}) {
    console.log('Successfully logged in')
    localStorage.setItem('userLoginCredentials', JSON.stringify(user))

    this.createUserInDatabase(user, params).then(() => this.router.navigate(['library']))
  }

  loginGoodreads(redirectPath?: string) {
    const redirectUri = redirectPath ? `${this.localDomain}/${redirectPath}` : this.redirectURI

    this.auth0 = new auth0.WebAuth({ ...this.defaultParams, redirectUri })

    this.auth0.authorize({ connection: 'goodreads' })
  }

  loginGoogle() {
    this.fireAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider)
      .then((response) => {
        this.processResponse(response.user)
      })
      .catch((error) => {
        console.log('Could not login')
        console.log(error)
      })
  }

  loginFacebook() {
    this.fireAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider)
      .then((response) => {
        this.processResponse(response.user)
      })
      .catch((error) => {
        console.log('Could not login')
        console.log(error)
      })
  }

  loginEmail({ email, password}, onError) {
    this.fireAuth.auth.signInWithEmailAndPassword(email, password)
      .then((response) => {
        this.processResponse(response.user)
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
        this.processResponse(response.user, { displayName: name })
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

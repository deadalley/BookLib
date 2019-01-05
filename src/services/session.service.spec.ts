import { TestBed, inject } from '@angular/core/testing'
import { AngularFireModule } from 'angularfire2'
import { AngularFireDatabaseModule } from 'angularfire2/database'
import { environment } from 'environments/environment'
import { assertThat, equalTo } from 'hamjest'

import { DatabaseService } from './database.service'
import { LibraryService } from './library.service'
import { SessionService } from './session.service'

import UserFactory from '../factories/user'

describe('SessionService', () => {
  let sessionService: SessionService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService, LibraryService, DatabaseService],
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireDatabaseModule,
      ],
    })

    sessionService = TestBed.get(SessionService)
    localStorage.clear()
  })

  it('should be created', inject(
    [SessionService],
    (service: SessionService) => {
      expect(service).toBeTruthy()
    }
  ))

  describe('builds the sessions correctly', () => {
    it('with user given', () => {
      const user = UserFactory.build()

      sessionService.buildSession(user)

      assertThat(sessionService.localUser, equalTo(user))
    })

    it('with local user present', () => {
      const user = UserFactory.build()

      sessionService.localUser = user
      sessionService.buildSession()
      assertThat(sessionService.localUser, equalTo(user))
    })

    it('throws error when no user found', () => {
      expect(() => sessionService.buildSession()).toThrow(
        new TypeError('Cannot read property \'ref\' of null')
      )
    })
  })

  it('sets the correct goodreads id', () => {
    const user = UserFactory.build()

    sessionService.localUser = user
    sessionService.setGoodreadsId('goodreads id')
    assertThat(sessionService.localUser.goodreadsId, equalTo('goodreads id'))
  })
})

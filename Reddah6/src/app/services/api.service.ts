import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { UserModel } from '../models/user-models';
import { Storage } from '@capacitor/storage';
import { map, switchMap, delay, tap } from 'rxjs/operators';
import { CachingService } from './caching.service';
import { ToastController } from '@ionic/angular';
import { Network } from '@capacitor/network';

const ACCESS_TOKEN_KEY = 'my-access-token';
const REFRESH_TOKEN_KEY = 'my-refresh-token';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Init with null to filter out the first value in a guard!
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  currentAccessToken = null;
  url = environment.api_url;

  connected = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController,
    private cachingService: CachingService,
  ) {
    Network.addListener('networkStatusChange', async status => {
      this.connected = status.connected;
    });

    // Can be removed once #17450 is resolved: https://github.com/ionic-team/ionic/issues/17450
    this.toastController.create({ animated: false }).then(t => { t.present(); t.dismiss(); });

    this.loadToken();
  }

  // Load accessToken on startup
  async loadToken() {
    const token = await Storage.get({ key: ACCESS_TOKEN_KEY });
    if (token && token.value) {
      this.currentAccessToken = token.value;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  // Get our secret protected data
  getSecretData() {
    return this.http.get(`${this.url}/users/secret`);
  }

  // Create new user
  signUp(credentials: { username, password }): Observable<any> {
    return this.http.post(`${this.url}/users`, credentials);
  }

  // Sign in a user and store access and refres token
  login(credentials: { username, password }): Observable<any> {
    return this.http.post(`${this.url}/api/auth/sign`, new UserModel(credentials.username, credentials.password)).pipe(
      switchMap((result: { Success, Message }) => {
        //console.log(result)
        this.currentAccessToken = result.Message;
        this.setCurrentJwt(result.Message);
        const storeAccess = Storage.set({ key: ACCESS_TOKEN_KEY, value: result.Message });
        console.log(1)
        const storeRefresh = Storage.set({ key: REFRESH_TOKEN_KEY, value: result.Message });
        console.log(2)
        return from(Promise.all([storeAccess, storeRefresh]));
      }),
      tap(_ => {
        this.isAuthenticated.next(true);
      })


      /*switchMap((tokens: {accessToken, refreshToken }) => {
        this.currentAccessToken = tokens.accessToken;
        const storeAccess = Storage.set({key: ACCESS_TOKEN_KEY, value: tokens.accessToken});
        const storeRefresh = Storage.set({key: REFRESH_TOKEN_KEY, value: tokens.refreshToken});
        return from(Promise.all([storeAccess, storeRefresh]));
      }),
      tap(_ => {
        this.isAuthenticated.next(true);
      })*/
    )
  }

  // Potentially perform a logout operation inside your API
  // or simply remove all local tokens and navigate to login
  logout() {
    return this.http.post(`${this.url}/auth/logout`, {}).pipe(
      switchMap(_ => {
        this.currentAccessToken = null;
        // Remove all stored tokens
        const deleteAccess = Storage.remove({ key: ACCESS_TOKEN_KEY });
        const deleteRefresh = Storage.remove({ key: REFRESH_TOKEN_KEY });
        return from(Promise.all([deleteAccess, deleteRefresh]));
      }),
      tap(_ => {
        this.isAuthenticated.next(false);
        this.router.navigateByUrl('/', { replaceUrl: true });
      })
    ).subscribe();
  }

  // Load the refresh token from storage
  // then attach it as the header for one specific API call
  getNewAccessToken() {
    const refreshToken = from(Storage.get({ key: REFRESH_TOKEN_KEY }));
    return refreshToken.pipe(
      switchMap(token => {
        if (token && token["value"]) {
          const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token["value"]}`
            })
          }
          return this.http.get(`${this.url}/auth/refresh`, httpOptions);
        } else {
          // No stored refresh token
          return of(null);
        }
      })
    );
  }

  // Store a new access token
  storeAccessToken(accessToken) {
    this.currentAccessToken = accessToken;
    return from(Storage.set({ key: ACCESS_TOKEN_KEY, value: accessToken }));
  }

  setCurrentJwt(jwt: string) {
    Storage.set({ key: "Reddah_CurrentJwt", value: jwt });
  }

  getCurrentJwt() {
    return Storage.get({ key: "Reddah_CurrentJwt" });
  }

  clearCurrentJwt() {
    Storage.remove({ key: "Reddah_CurrentJwt" });
  }

  setCurrentUser(userName: string) {
    Storage.set({ key: "Reddah_CurrentUser", value: userName });
  }

  getCurrentUser() {
    return Storage.get({ key: "Reddah_CurrentUser" });
  }

  log(message) {
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }





  //api list
  getFindPageTopic(formData: FormData, cacheKey, forceRefresh): Observable<any> {
    const url = `${this.url}/api/article/getfindtopic`;
    return this.postData(url, formData, cacheKey, forceRefresh);
  }


  // Caching Functions
  private postData(url, formData: FormData, cacheKey, forceRefresh = false): Observable<any> {
    // Handle offline case
    if (!this.connected) {
      this.toastController.create({
        message: 'You are viewing offline data.',
        duration: 2000
      }).then(toast => {
        toast.present();
      });
      return from(this.cachingService.getCachedRequest(url+cacheKey));
    }

    // Handle connected case
    if (forceRefresh) {
      // Make a new API call
      return this.callAndCache(url, formData, cacheKey);
    } else {
      // Check if we have cached data
      const storedValue = from(this.cachingService.getCachedRequest(url+cacheKey));
      return storedValue.pipe(
        switchMap(result => {
          if (!result) {
            // Perform a new request since we have no data
            return this.callAndCache(url, formData, cacheKey);
          } else {
            // Return cached data
            return of(result);
          }
        })
      );
    }
  }

  private callAndCache(url, formData: FormData, cacheKey): Observable<any> {
    return this.http.post<any>(url, formData).pipe(
      delay(2000), 
      tap(res => {
        this.cachingService.cacheRequest(url+cacheKey, res);
      })
    )
  }










  // Standard API Functions
/*
  getUsers(forceRefresh: boolean) {
    const url = 'https://randomuser.me/api?results=10';
    return this.getData(url, forceRefresh).pipe(
      map(res => res['results'])
    );
  }

  getChuckJoke(forceRefresh: boolean) {
    const url = 'https://api.chucknorris.io/jokes/random';
    return this.getData(url, forceRefresh);
  }*/
  


}
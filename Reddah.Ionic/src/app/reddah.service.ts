import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Article } from "./article";
import { UserProfileModel } from './UserProfileModel';
import { Locale } from './locale';

@Injectable({
  providedIn: 'root'
})
export class ReddahService {

  constructor(private http: HttpClient) { }

  private log(message: string) {
    console.log(message);
  }

  public Locales = [
      new Locale("zh-CN", "中华人民共和国 (China)"),
      new Locale("fr-FR", "France"),
      new Locale("ja-JP", "日本 (Japan)"),
      new Locale("ko-KR", "대한민국 (Korea)"),
      new Locale("en-US", "United States"),
  ];
 
  private heroesUrl = 'https://reddah.com/api/webapi/getarticles'; 

  private userProfileModel: UserProfileModel;

  getHeroes(loadedIds: Number[], locale: String, menu: String): Observable<Article[]> {
    this.userProfileModel = new UserProfileModel();
    this.userProfileModel.LoadedIds = loadedIds;
    this.userProfileModel.Locale = locale;
    this.userProfileModel.Menu = menu;
    this.userProfileModel.Token = "";
    this.userProfileModel.Sub = "";
    this.userProfileModel.User = "";
    this.userProfileModel.Keyword = "";

    /*const httpOptions = {
      headers: new HttpHeaders({ 
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin*':'*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS, POST, PUT',
        'Access-Control-Allow-Headers':'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
      }),
      body: this.userProfileModel
      
    };*/

    return this.http.post<Article[]>(this.heroesUrl, this.userProfileModel)//httpOptions)
      .pipe(
        tap(heroes => this.log('fetched subs')),
        catchError(this.handleError('getReddahSubs', []))
      );
  }

/*
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }
  updateHero (hero: Hero): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
  
    return this.http.put(this.heroesUrl, hero, httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  addHero (hero: Hero): Observable<Hero> {

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.post<Hero>(this.heroesUrl, hero, httpOptions).pipe(
      tap((hero: Hero) => this.log(`added hero w/ id=${hero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  deleteHero (hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.delete<Hero>(url, httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }
  
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // if not search term, return empty hero array.
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }
*/
  /**
 * Handle Http operation that failed.
 * Let the app continue.
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}

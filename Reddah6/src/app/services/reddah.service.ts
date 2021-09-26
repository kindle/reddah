import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReddahService {

  constructor(
    private http: HttpClient
  ) { }

  localeData;
  loadTranslate(locale){
      this.http.get<any>(`assets/i18n/${locale}.json`)
      .subscribe(res =>{
          this.localeData=this.flatten(res);
          //this.initPointTask();
      }, error =>{
          console.log(error);
      });
  }

  instant(key){
      if(this.localeData)
          return this.localeData[key];
      return key;
  }

  flatten (obj, prefix = [], current = {}) {
      if (typeof (obj) === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          this.flatten(obj[key], prefix.concat(key), current)
        })
      } else {
        current[prefix.join('.')] = obj
      }
    
      return current
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextService {

  constructor() { }

  doubleByteLocale = ["zh-cn","zh-tw","ja-jp","ko-kr"];

  summaryShort(str: string, n: number, fix: string,  locale='en-US') {
      if(locale==null)
          locale='en-US';
      locale = locale.toLowerCase();
      if(!this.doubleByteLocale.includes(locale))
          n = 2*n;
      str = this.htmlDecode(str)
          
      if(str.startsWith("<br>"))
          str = str.replace("<br>", "");
      return this.subpost(str, n, fix);
  }

  htmlDecode(text: string) {
      var temp = document.createElement("div");
      temp.innerHTML = text;
      var output = temp.innerText || temp.textContent;
      temp = null;
      
      output = output.replace(/\"\/uploadPhoto/g, "\"\/\/\/reddah.com\/uploadPhoto");
      output = output.replace(/\"\/\/\/reddah.com\/uploadPhoto/g, "\"https:\/\/reddah.com\/uploadPhoto");
      output = output.replace(/\"\/\/\/login.reddah.com\/uploadPhoto/g, "\"https:\/\/login.reddah.com\/uploadPhoto");
      
      return output;
  }

  htmlDecode2(text: string) {
      return this.htmlDecode(this.htmlDecode(text));
  }

  subpost(str: string, n: number, sufix="...") {
      var r = /[^\u4e00-\u9fa5]/g;
      if (str.replace(r, "mm").length <= n) { return str; }
      var m = Math.floor(n/2);
      for (var i = m; i < str.length; i++) {
          if (str.substr(0, i).replace(r, "mm").length >= n) {
              return str.substr(0, i) + sufix;
          }
      }
      return str;
  }
}

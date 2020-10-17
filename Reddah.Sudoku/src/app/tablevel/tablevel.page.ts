import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tablevel',
  templateUrl: 'tablevel.page.html',
  styleUrls: ['tablevel.page.scss']
})
export class TabLevelPage implements OnInit{

  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private router: Router,
    ) {}

    ngOnInit(){
      this.addScriptByUrl(`/assets/js/jquery.js`);
      this.addScriptByUrl("/assets/js/jsapi_share.js");
    }

    ionViewDidEnter(){
      this.addScriptByUrl("/assets/level/start.js");
    }

    addScriptByUrl(src){
      let key = this.nonce_str()+"_js";
  
      let s = this._renderer2.createElement('script');
      s.type = "text/javascript";
      s.src = src;
      s.id = key;
      
      this._renderer2.appendChild(
          this._document.body.getElementsByTagName("app-tablevel")[0], s);
      
    }

    nonce_str() {
        return 'xxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 10 | 0, v = r;
            return v.toString(10);
        });
    }


  goLevel(n){
    this.router.navigate(['/tabs/tab2'], {
        queryParams: {
            level: n,
        }
    });
  }

  goHome(){
    this.router.navigate(['/tabs/tab1'], {
      queryParams: {
      }
  });
  }

}

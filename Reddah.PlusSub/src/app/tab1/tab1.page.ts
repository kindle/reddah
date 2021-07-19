import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  questions = [];

  constructor() {
    for(var i=0;i<50;i++){
      var sign = this.getRandomInt(10)%2 == 0;
      var a = this.getRandomInt(100);
      var b = this.getRandomInt(100);
      var result = sign?a+b:a-b;

      if(result<0||result>100)
      {
        i--;
        continue;
      }
      
      this.questions.push({a: a, sign: sign?"+":"-", b: b, result:result});
    }

  }

  getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
  }

}

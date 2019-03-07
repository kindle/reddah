import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Input() data;
  
  constructor() { }

  ngOnInit() {
  }

  foo(){
    
  }

  htmlDecode(text: string) {
    var temp = document.createElement("div");
      temp.innerHTML = text;
      var output = temp.innerText || temp.textContent;
      temp = null;
      //output = output.replace(/src=\"\/uploadPhoto/g, "imageViewer src=\"\/\/\/reddah.com\/uploadPhoto");
      output = output.replace(/\"\/uploadPhoto/g, "\"\/\/\/reddah.com\/uploadPhoto");
      return output;
  }

}

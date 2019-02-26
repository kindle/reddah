import { Component, OnInit, Input } from '@angular/core';
import { Article } from '../article';
import { PhotoViewer } from '@ionic-native/photo-viewer';

@Component({
  selector: 'app-postviewer',
  templateUrl: './postviewer.page.html',
  styleUrls: ['./postviewer.page.scss'],
})
export class PostviewerPage implements OnInit {
  @Input() article: Article;
  constructor() { }

  ngOnInit() {
  }

  htmlDecode(text: string) {
    var temp = document.createElement("div");
      temp.innerHTML = text;
      var output = temp.innerText || temp.textContent;
      temp = null;
      output = output.replace(/\"\/uploadPhoto/g, "\"\/\/\/reddah.com\/uploadPhoto");
      return output;
  }

  viewer(event){

    var options = {
        share: true, // default is false
        closeButton: true, // default is true
        copyToReference: true // default is false
    };

    var target = event.target || event.srcElement || event.currentTarget;
    if(target.tagName.toUpperCase()==="IMG"){
      //PhotoViewer.show(target.src, 'view photo', options);
      PhotoViewer.show(target.src);
    }
  }

}

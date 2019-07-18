import { Component, OnInit, Input, SecurityContext, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-mini-viewer',
    templateUrl: './mini-viewer.component.html',
    styleUrls: ['./mini-viewer.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MiniViewerComponent implements OnInit {
    @Input() content;

    html;

    constructor(
        private modalController: ModalController,
        public reddah: ReddahService,
        private sanitizer: DomSanitizer,
    ) {
    }

    ngOnInit() {
        let text = this.reddah.htmlDecode(this.content);
        
        this.html = this.sanitizer.bypassSecurityTrustHtml(text);
        
    }

    
    

    close() {
        this.modalController.dismiss();
    }

  
}

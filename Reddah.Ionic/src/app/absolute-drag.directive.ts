import { Directive, Input, ElementRef, Renderer2 } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
    selector: '[absolute-drag]'
  })
export class AbsoluteDragDirective {
    @Input('startRight') startRight: any;
    @Input('startTop') startTop: any;
 
    constructor(
        public element: ElementRef, 
        public renderer: Renderer2, 
        public domCtrl: DomController) 
    {}
 
    ngAfterViewInit() {
        this.renderer.setStyle(this.element.nativeElement, 'position', 'absolute');
        this.renderer.setStyle(this.element.nativeElement, 'right', this.startRight + 'px');
        this.renderer.setStyle(this.element.nativeElement, 'top', this.startTop + 'px');
 
        let hammer = new window['Hammer'](this.element.nativeElement);
        hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_ALL });
 
        hammer.on('pan', (ev) => {
            this.handlePan(ev);
        });
    }
 
    handlePan(ev){
        let newRight = ev.center.x;
        let newTop = ev.center.y;
        let height = document.body.clientHeight;
        let see_heiht = height;
 
        this.domCtrl.write(() => {
            this.renderer.setStyle(this.element.nativeElement, 'right', '10px');
            if(newTop<=10){
                this.renderer.setStyle(this.element.nativeElement, 'top', '10px');
            }
            else if(newTop>=see_heiht){
                this.renderer.setStyle(this.element.nativeElement, 'top', see_heiht + 'px');
            }
            else{
                this.renderer.setStyle(this.element.nativeElement, 'top', newTop + 'px');
            }
            
        });
 
    }

}
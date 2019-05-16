import { Directive, HostListener, ElementRef, Input } from "@angular/core";

@Directive({
    selector: "ion-textarea[autoresize]" // Attribute selector
})
export class AutoresizeDirective {
    @HostListener('input', ['$event.target'])
    onInput(textArea: HTMLTextAreaElement): void {
        this.adjustSimple();
    }

    @Input('autoresize') maxHeight: number;
    
    constructor(public element: ElementRef) {}
    
    ngOnInit(): void {
        this.adjustSimple();
    }

    adjustSimple(): void {
        let ta = this.element.nativeElement.getElementsByTagName('TEXTAREA')[0];
        console.log(this.element.nativeElement.getElementsByTagName('TEXTAREA'))
        if(ta){
            console.log('trigger')
            ta.style.overflow = "hidden";
            ta.style.height = "auto";
            ta.style.height = ta.scrollHeight + "px";
        }
    }
  
    adjust(): void {
        let ta = this.element.nativeElement.querySelector("textarea"),
        newHeight;
          
        if (ta) {
            ta.style.overflow = "hidden";
            ta.style.height = "auto";
            if (this.maxHeight) {
                console.log('this.maxHeight',this.maxHeight)
                newHeight = Math.min(ta.scrollHeight, this.maxHeight);
                console.log('newHeight',newHeight)
            } 
            else 
            {
                newHeight = ta.scrollHeight;
            }
            ta.style.height = newHeight + "px";
        }
    }

}
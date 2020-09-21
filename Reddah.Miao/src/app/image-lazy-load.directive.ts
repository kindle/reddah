import { Directive, HostListener, ElementRef, Input } from "@angular/core";

@Directive({
    selector: "ion-content[lazyscroll]" // Attribute selector
})
export class ImageLazyLoadDirective {
    @HostListener('input', ['$event.target'])
    onInput(textArea: HTMLTextAreaElement): void {
        this.adjust();
    }

    @Input('autoresize') maxHeight: number;
    
    constructor(public element: ElementRef) {
        alert('lazyScroll')
    }
    
    ngOnInit(): void {
        alert('lazyScroll')
        this.adjust();
    }
    adjust(): void {
        let shadowRoot = this.element.nativeElement.shadowRoot;
        if(shadowRoot){
            let ta = shadowRoot.querySelector("textarea"), newHeight;
          
            if (ta) {
                ta.style.overflow = "hidden";
                ta.style.height = "auto";
                if (this.maxHeight) {
                    newHeight = Math.min(ta.scrollHeight, this.maxHeight);
                } 
                else 
                {
                    newHeight = ta.scrollHeight;
                }
                ta.style.height = newHeight + "px";
            }
        }
    }

}
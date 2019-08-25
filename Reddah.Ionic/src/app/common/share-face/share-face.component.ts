import { Component, Output, EventEmitter } from '@angular/core';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-share-face',
    templateUrl: './share-face.component.html',
    styleUrls: ['./share-face.component.scss']
})
export class ShareFaceComponent {

    @Output() select = new EventEmitter<any>();

    slideOpts = {
        centeredSlides: 'true',
        initialSlide: 0,
    };
    
    emojis = [
        [
            ['😀','😃','😄','😁','😆','😅'],
            ['❤️','⚽️','🏀','🍎','🍉','☕️'],
            ['🌈','☀️','🌧','🐶','🐱','🐷'],
            ['😎','😱','😴','👍','👎','💪'],
        ],
        [
            ['🙏','😜','😡','😍','👻','💩'],
        ]
    ];

    constructor(
        public reddah: ReddahService,
    ) { }

    faceSelection(face) {
        this.select.emit(face);
    }

    
    

}

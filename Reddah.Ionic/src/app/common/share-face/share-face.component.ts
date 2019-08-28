import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { ReddahService } from '../../reddah.service';

@Component({
    selector: 'app-share-face',
    templateUrl: './share-face.component.html',
    styleUrls: ['./share-face.component.scss']
})
export class ShareFaceComponent implements OnInit  {

    @Output() select = new EventEmitter<any>();
    
    emojis = [
        [
            '😀','😃','😄','😁','😆','😅',
            '❤️','⚽️','🏀','🍎','🍉','☕️',
            '🌈','☀️','🌧','🐶','🐱','🐷',
            '😎','😱','😴','👍','👎','💪',
        ],
        [
            '🙏','😜','😡','😍','👻','💩',
            '👌','👏','👉','✊','🔔','⭐',
            '💣','🚩','💘','❌','🍹','🍺',
            '🍬','🍗','🍦','🍰','💎','💍',
        ],
        [
            '💋','🎵','🎨','🚀','✈','🏆',
            '📢','📞','🎉','🎁','💊','🔪',
            '🔥','😓','😭','😊','😳','😍',
            '👻','🍌','⏳','⚡','🌂','☁',
        ]
    ]; 

    slideOpts = {
        centeredSlides: 'true',
        initialSlide: 0,
    };
    
    constructor(
        public reddah: ReddahService,
    ) { }

    faceSelection(face) {
        this.select.emit(face);
    }

    ngOnInit(){
    }

    ionViewWillEnter(){
        
    }
    
    

}

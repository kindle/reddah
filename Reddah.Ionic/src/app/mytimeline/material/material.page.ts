import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { IonInfiniteScroll, IonContent, LoadingController, NavController, PopoverController, ModalController, AlertController, } from '@ionic/angular';
import { ReddahService } from '../../reddah.service';
import { LocalStorageService } from 'ngx-webstorage';
import { TranslateService } from '@ngx-translate/core';
import { TimelinePopPage } from '../../common/timeline-pop.page';
import { UserPage } from '../../common/user/user.page';
import { ImageViewerComponent } from '../../common/image-viewer/image-viewer.component';
import { CacheService } from "ionic-cache";
import { Router, ActivatedRoute } from '@angular/router';
import { ArticleTextPopPage } from '../../common/article-text-pop.page'
import { AddMaterialPage } from '../../mytimeline/add-material/add-material.page'
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
    selector: 'app-material',
    templateUrl: 'material.page.html',
    styleUrls: ['material.page.scss']
})
export class MaterialPage implements OnInit {
    userName: string;
    articles = [];
    loadedIds = [];
    formData: FormData;
    showAddComment = false;

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    @ViewChild('pageTop') pageTop: IonContent;
        
    loadData(event) {
        this.getMyMaterial(event);
    }

    close(){
        this.modalController.dismiss();
    }

    constructor(
        public reddah : ReddahService,
        public loadingController: LoadingController,
        public translateService: TranslateService,
        public navController: NavController,
        private renderer: Renderer2,
        public modalController: ModalController,
        private localStorageService: LocalStorageService,
        private popoverController: PopoverController,
        private cacheService: CacheService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private transfer: FileTransfer, 
        private file: File,
        private statusBar: StatusBar,
        private alertController: AlertController,
        private translate: TranslateService,
    ){
        this.userName = this.reddah.getCurrentUser();
    }
    
    ngOnInit(){
        this.reddah.getUserPhotos(this.userName, true);

        let cachedArticles = this.localStorageService.retrieve("Reddah_mymaterial");
        let cachedIds = this.localStorageService.retrieve("Reddah_mymaterial_ids");
        if(cachedArticles){
            this.articles = JSON.parse(cachedArticles);
            this.loadedIds = JSON.parse(cachedIds);
        }

        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify([]));

        let cacheKey = "this.reddah.getMyMaterial";
        let request = this.reddah.getMyMaterial(this.formData);

        this.cacheService.loadFromObservable(cacheKey, request, "MyMaterialPage")
        .subscribe(material => 
        {
            if(cachedArticles!=JSON.stringify(material))
            {
                this.articles = [];
                this.loadedIds = [];

                for(let article of material){
                    this.articles.push(article);
                    this.loadedIds.push(article.Id);
                    
                    //cache user image
                    this.reddah.toImageCache(article.UserPhoto, `userphoto_${article.UserName}`);
                    //cache preview image
                    article.Content.split('$$$').forEach((previewImageUrl)=>{
                        this.reddah.toFileCache(previewImageUrl);
                    });
                    
                }

                this.localStorageService.store("Reddah_mymaterial",JSON.stringify(material));
                this.localStorageService.store("Reddah_mymaterial_ids",JSON.stringify(this.loadedIds));

            }
        });
    }
    
    isMe(userName){
        return userName==this.reddah.getCurrentUser();
    }

    getMyMaterial(event):void {
        this.formData = new FormData();
        this.formData.append("loadedIds", JSON.stringify(this.loadedIds));
        
        let cacheKey = "this.reddah.getMyMaterial" + this.loadedIds.join(',');
        let request = this.reddah.getMyMaterial(this.formData);
        
        this.cacheService.loadFromObservable(cacheKey, request, "MyMaterialPage")
        .subscribe(material => 
        {
            for(let article of material){
                this.articles.push(article);
                this.loadedIds.push(article.Id);
                
                //cache user image
                this.reddah.toImageCache(article.UserPhoto, `userphoto_${article.UserName}`);
                //cache preview image
                article.Content.split('$$$').forEach((previewImageUrl)=>{
                    this.reddah.toFileCache(previewImageUrl);
                });
            }

            this.localStorageService.store("Reddah_mymaterial", JSON.stringify(material));
            this.localStorageService.store("Reddah_mymaterial_ids", JSON.stringify(this.loadedIds));

            if(event){
                event.target.complete();
            }
        });

    }

    clearCacheAndReload(event){
        this.pageTop.scrollToTop();
        this.cacheService.clearGroup("MyMaterialPage");
        this.loadedIds = [-1];
        this.articles = [];
        this.localStorageService.clear("Reddah_mymaterial");
        this.localStorageService.clear("Reddah_mymaterial_ids");
        this.getMyMaterial(event);
    }

    doRefresh(event) {
        setTimeout(() => {
            this.clearCacheAndReload(event);
        }, 2000);
    }

    @ViewChild('headerStart')
    headerStart:ElementRef;
    @ViewChild('headerOnScroll')
    headerOnScroll:ElementRef;
    @ViewChild('timelineCover')
    timelineCover:ElementRef;
    

    onScroll($event) {

        this.showAddComment = false;
        
        let offset = this.timelineCover.nativeElement.scrollHeight - $event.detail.scrollTop;
        
        if(offset>=250)
        {
            this.renderer.setStyle(this.headerStart.nativeElement, 'visibility', 'visible');
            this.renderer.setStyle(this.headerStart.nativeElement, 'opacity', '8');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
            
        }
        else if(offset<250 && offset>=150)
        {
            let opacity = (offset-150)/100;
            if(opacity<0) opacity=0;
            this.renderer.setStyle(this.headerStart.nativeElement, 'opacity', opacity + '');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'visibility', 'hidden');
        }
        else if(offset<150 && offset>=-150){
            let opacity = (1-(offset-150)/100);
            if(opacity>1) opacity=1;
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'opacity', opacity + '');
        }
        else
        {
            this.renderer.setStyle(this.headerStart.nativeElement, 'visibility', 'hidden');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'visibility', 'visible');
            this.renderer.setStyle(this.headerOnScroll.nativeElement, 'opacity', '8');
        }
    }

    async post(ev: any) {
        const popover = await this.popoverController.create({
            component: TimelinePopPage,
            animated: false,
            translucent: true,
            cssClass: 'post-option-popover'
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if(data==1||data==2||data==3){
            //data=1: take a photo, data=2: lib photo, data=3: lib video
            this.goPost(data);
        }
    }

    async goPost(postType){
        const postModal = await this.modalController.create({
            component: AddMaterialPage,
            componentProps: { postType: postType },
            cssClass: "modal-fullscreen",
        });
          
        await postModal.present();
        const { data } = await postModal.onDidDismiss();
        if(data){
            this.doRefresh(null);
        }
    }

    async viewer(index, imageSrcArray) {
        const modal = await this.modalController.create({
            component: ImageViewerComponent,
            componentProps: {
                index: index,
                imgSourceArray: this.reddah.preImageArray(imageSrcArray),
                imgTitle: "",
                imgDescription: "",
                showDownload: true,
            },
            cssClass: 'modal-fullscreen',
            keyboardClose: true,
            showBackdrop: true
        });
    
        return await modal.present();
    }
  
    async goUser(userName){
        const userModal = await this.modalController.create({
            component: UserPage,
            componentProps: { 
                userName: userName
            },
            cssClass: "modal-fullscreen",
        });
          
        await userModal.present();
    }

    async fullText(text){
        const textModal = await this.modalController.create({
            component: ArticleTextPopPage,
            componentProps: { text: text },
            cssClass: "modal-fullscreen",
        });
          
        await textModal.present();
    }


    async delete(article){
        const alert = await this.alertController.create({
            header: this.translate.instant("Confirm.Title"),
            message: this.translate.instant("Confirm.DeleteMessage"),
            buttons: [
            {
                text: this.translate.instant("Confirm.Cancel"),
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {}
            }, 
            {
                text: this.translate.instant("Confirm.Yes"),
                handler: () => {
                    //ui delete
                    this.articles.forEach((item, index)=>{
                        if(item.Id==article.Id){
                            this.articles.splice(index, 1);
                        }
                    })
                    this.localStorageService.store("Reddah_mymaterial",this.articles);
                    this.cacheService.clearGroup("MyMaterialPage");
                    
                    //serivce delete
                    let formData = new FormData();
                    formData.append("Id",JSON.stringify(article.Id));
                    this.reddah.deleteArticle(formData).subscribe(data=>{
                        
                    });
                }
            }]
        });

        await alert.present().then(()=>{});
    }
}

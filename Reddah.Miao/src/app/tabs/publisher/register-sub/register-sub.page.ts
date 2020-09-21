import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReddahService } from '../../../reddah.service';
import { LoadingController } from '@ionic/angular';

@Component({
    selector: 'app-register-sub',
    templateUrl: './register-sub.page.html',
    styleUrls: ['./register-sub.page.scss'],
})
export class RegisterSubPage implements OnInit {
    @Input() type;//1:sub,2:pub,3:mini
    @Input() title : string;

    constructor(private modalController: ModalController,
        public reddah: ReddahService,
        private loadingController: LoadingController,
    ) { }

    locale;
    ngOnInit() {
        this.locale = this.reddah.getCurrentLocale();
        this.email = this.reddah.appData('useremail_'+this.reddah.getCurrentUser());
    }

    nickname = "";//as sub name
    signature = "";//as sub description
    email = "";
    agreed = false;

    async register() {
        if (this.nickname.length == 0) {
            this.reddah.toast(this.reddah.instant("Input.Error.SubNameEmpty"));
        }else if (this.nickname.length < 2) {
            this.reddah.toast(this.reddah.instant("Input.Error.SubNameTooShort"));
        }else if (this.signature.length == 0) {
            this.reddah.toast(this.reddah.instant("Input.Error.SubDescEmpty"));
        }else if (this.email.length == 0) {
            this.reddah.toast(this.reddah.instant("Input.Error.EmailEmpty"));
        }
        else if (!this.agreed) {
            this.reddah.toast(this.reddah.instant("Input.Error.Agree"));
        }
        else {
            const loading = await this.loadingController.create({
                message: this.reddah.instant("Register.Loading"),
                spinner: 'circles',
            });
            await loading.present();
            
            let formData = new FormData();
            formData.append("Type", this.type);
            formData.append("NickName", this.nickname);
            formData.append("Signature", this.signature);
            formData.append("Email", this.email);
            formData.append("Locale", this.reddah.getCurrentLocale());
            //mail
            formData.append("MailTitle", this.reddah.instant("Mail.Title"));
            formData.append("MailSub", this.reddah.instant("Mail.RegisterPub.Sub"));
            formData.append("MailParaStart", this.reddah.instant("Mail.RegisterPub.ParaStart"));
            formData.append("MailParaEnd", this.reddah.instant("Mail.ParaEnd"));
            this.reddah.registerSub(formData)
            .subscribe(result => 
            {
                loading.dismiss();
                if(result.Success==0){
                    this.reddah.toast(this.reddah.instant("Register.SuccessNonUser"), "primary");
                    
                    this.modalController.dismiss(true);
                }
                else{
                    this.reddah.toast(result.Message, "danger");
                }
                
            });
        }
    }

    async close(){
        await this.modalController.dismiss(null);
    }

    getLocale(){
        return this.reddah.getCurrentLocale();
    }

    async browse(policy){
        this.reddah.Browser(`https://reddah.com/${this.locale}/t/help/${policy}`);
    }
}

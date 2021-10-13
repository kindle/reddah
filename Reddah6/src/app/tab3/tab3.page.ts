import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { CachingService } from '../services/caching.service';
import { I18nService } from '../services/i18n.service';
import { TextService } from '../services/text.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(
    private apiService: ApiService,
    public i18n: I18nService,
    public text: TextService,
    private cachingService: CachingService, 
    private loadingController: LoadingController
    
  ) {}


  joke = null;
  users = null;

  async loadChuckJoke(forceRefresh) {
    const loading = await this.loadingController.create({
      message: 'Loading data..'
    });
    await loading.present();
 
    /*
    this.apiService.getChuckJoke(forceRefresh).subscribe(res => {
      this.joke = res;
      loading.dismiss();
    });
    */
  }
 
  async refreshUsers(event?) {
    const loading = await this.loadingController.create({
      message: 'Loading data..'
    });
    await loading.present();
 
    const refresh = event ? true : false;
 /*
    this.apiService.getUsers(refresh).pipe(
      finalize(() => {        
        if (event) {
          event.target.complete();
        }
        loading.dismiss();
      })
    ).subscribe(res => {      
      this.users = res;
    })
    */
  }
 
  async clearCache() {
    this.cachingService.clearCachedData();
  }
  
}

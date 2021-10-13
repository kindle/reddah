import { Component } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { CachingService } from './services/caching.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private cachingService: CachingService) {
    this.cachingService.initStorage();
    this.createCacheFolder();
  }

  async createCacheFolder(){
    try {
      let ret = await Filesystem.mkdir({
        directory:Directory.Cache,
        path: `CACHED-IMG`,
        recursive: false,
      })
      //console.log('folder ', ret)
    } catch (e) {
      //console.error("Unable to make directory, director exist for example", e);
    }
  }
}

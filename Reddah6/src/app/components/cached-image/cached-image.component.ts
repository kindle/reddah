import { Component, Input, OnInit } from '@angular/core';
import { Directory, Filesystem, FilesystemDirectory } from '@capacitor/filesystem';

const CACHE_FOLDER = 'CACHED-IMG';

@Component({
  selector: 'cached-image',
  templateUrl: './cached-image.component.html',
  styleUrls: ['./cached-image.component.scss'],
})
export class CachedImageComponent {

  _src = '';
  @Input() spinner = false;

  constructor() { }

  @Input()
  set src(imageUrl: string){
    //console.log('SET SOURC URL', imageUrl);

    const imageName =   imageUrl.split('/').pop();
    const fileType =   imageUrl.split('.').pop();

    Filesystem.readFile({
      directory: Directory.Cache,
      path: `${CACHE_FOLDER}/${imageName}`
    }).then(readFile=>{
      //console.log('Local file: ', readFile);
      //set to  SRC
      this._src = `data:image/${fileType};base64,${readFile.data}`
    }).catch(async e=>{
      //write the file
      await this.storeImage(imageUrl,imageName);
      Filesystem.readFile({
        directory: Directory.Cache,
        path: `${CACHE_FOLDER}/${imageName}`
      }).then(readFile=>{
        this._src = `data:image/${fileType};base64,${readFile.data}`
      });
    })
  }

  async storeImage(url, path){
    const response = await fetch(`https://api-cors-proxy-devdactic.herokuapp.com/${url}`);
    const blob = await response.blob();
    const base64Data = await this.convertBlobToBase64(blob) as string;
    const savedFile = await Filesystem.writeFile({ 
      path: `${CACHE_FOLDER}/${path}`,
      data: base64Data,
      directory: Directory.Cache
    })
    return savedFile;
  }

  convertBlobToBase64(blob: Blob){
    return new Promise((resolve, reject)=>{
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = ()=>{
        resolve(reader.result);
      }
      reader.readAsDataURL(blob);
    })
  }

}

import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss']
})
export class Tab5Page {
  secretData = null;
 
  constructor(private apiService: ApiService) { }
 
  ngOnInit() { }
 
  async getData() {
    this.secretData = null;
 
    this.apiService.getSecretData().subscribe((res: any) => {
      this.secretData = res.msg;
    });
  }
 
  logout() {
    this.apiService.logout();
  }
}

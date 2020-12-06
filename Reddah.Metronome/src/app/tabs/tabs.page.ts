import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReddahService } from '../reddah.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(
    public reddah: ReddahService,
    private router: Router,
  ) {}

  add(){
    this.router.navigate(['/tabs/tab2'], {
        queryParams: {
        }
    });
  }
}

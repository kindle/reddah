import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private authService: AuthService,) {}

  login() {
    this.authService.login();
  }
 
  logout() {
    this.authService.logout();
  }
 
  isAuthenticated() {
    return this.authService.authenticated();
  }
}

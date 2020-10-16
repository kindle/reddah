import { Injectable }       from '@angular/core';
import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanActivateChild,
    CanLoad, Route
}                           from '@angular/router';
import { AuthService }      from './auth.service';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
    constructor(private authService: AuthService, 
        private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let url: string = state.url;
        return this.checkLogin(url);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let url: string = state.url;
        return this.checkLogin(url);
    }

    canLoad(route: Route) {
        let url = `/${route.path}`;

        return this.checkLogin(url);
    }

    checkLogin(url: string) {
        if (this.authService.authenticated()) { return true; }
        // Store the attempted URL for redirecting
        this.authService.redirectUrl = url;

        this.router.navigate(['surface']);
    }
}
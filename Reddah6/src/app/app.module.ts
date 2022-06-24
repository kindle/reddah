import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
 
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { IonicModule, IonicRouteStrategy, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';  

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { IonicStorageModule } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { Drivers } from '@ionic/storage';

import { HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
import { SigninPage } from './surface/signin/signin.page';
import { ForgotPage } from './surface/forgot/forgot.page';
import { RegisterPage } from './surface/register/register.page';
import { FormsModule } from '@angular/forms';
//import {BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'

@NgModule({
  declarations: [
    AppComponent,SigninPage,RegisterPage,ForgotPage
  ],
  entryComponents: [SigninPage,RegisterPage,ForgotPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    //BrowserAnimationsModule,
    ///BlobServiceClient,
    //StorageSharedKeyCredential,
    BrowserModule, 
    CommonModule,
    FormsModule,
    HammerModule,
    HttpClientModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    IonicStorageModule.forRoot({
      driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB]
    }),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

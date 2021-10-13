import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page {

  products = [];

  constructor(
    private http: HttpClient
  ) {
    this.loadProducts();
  }

  loadProducts(){
    this.http.get<any[]>('https://fakestoreapi.com/products').subscribe(res=>{
      this.products = res;
    });
  }

}

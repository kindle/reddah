import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Tab1homePage } from './tab1home.page';

describe('Tab1homePage', () => {
  let component: Tab1homePage;
  let fixture: ComponentFixture<Tab1homePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Tab1homePage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab1homePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

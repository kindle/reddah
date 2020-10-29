import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Tab2levelPage } from './tab2level.page';

describe('Tab2levelPage', () => {
  let component: Tab2levelPage;
  let fixture: ComponentFixture<Tab2levelPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Tab2levelPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab2levelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Tab3listPage } from './tab3list.page';

describe('Tab3listPage', () => {
  let component: Tab3listPage;
  let fixture: ComponentFixture<Tab3listPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Tab3listPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab3listPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

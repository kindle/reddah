import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Tab5TestPage } from './tab5test.page';

describe('Tab5TestPage', () => {
  let component: Tab5TestPage;
  let fixture: ComponentFixture<Tab5TestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Tab5TestPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab5TestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

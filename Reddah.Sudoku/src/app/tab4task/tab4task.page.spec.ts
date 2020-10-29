import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Tab4taskPage } from './tab4task.page';

describe('Tab4taskPage', () => {
  let component: Tab4taskPage;
  let fixture: ComponentFixture<Tab4taskPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Tab4taskPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab4taskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

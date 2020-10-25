import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TabLevelPage } from './tablevel.page';

describe('TabLevelPage', () => {
  let component: TabLevelPage;
  let fixture: ComponentFixture<TabLevelPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabLevelPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TabLevelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

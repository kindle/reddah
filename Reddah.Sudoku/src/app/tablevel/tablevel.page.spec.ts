import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { TabLevelPage } from './tablevel.page';

describe('TabLevelPage', () => {
  let component: TabLevelPage;
  let fixture: ComponentFixture<TabLevelPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabLevelPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TabLevelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

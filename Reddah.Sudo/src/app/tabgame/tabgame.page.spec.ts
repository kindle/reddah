import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { TabGamePage } from './tabgame.page';

describe('TabGamePage', () => {
  let component: TabGamePage;
  let fixture: ComponentFixture<TabGamePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabGamePage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TabGamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

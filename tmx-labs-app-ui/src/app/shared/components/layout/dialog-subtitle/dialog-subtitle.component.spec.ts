import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogSubtitleComponent } from './dialog-subtitle.component';

describe('DialogSubtitleComponent', () => {
  let component: DialogSubtitleComponent;
  let fixture: ComponentFixture<DialogSubtitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogSubtitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogSubtitleComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('leftContent', 'Test Subtitle');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

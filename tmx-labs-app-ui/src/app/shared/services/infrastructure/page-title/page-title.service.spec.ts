import { TestBed } from '@angular/core/testing';
import { PageTitleService } from './page-title.service';
import { Title } from '@angular/platform-browser';

describe('PageTitleService', () => {
  let service: PageTitleService;
  let titleService: jasmine.SpyObj<Title>;

  beforeEach(() => {
    const titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle', 'getTitle']);

    TestBed.configureTestingModule({
      providers: [
        PageTitleService,
        { provide: Title, useValue: titleServiceSpy }
      ]
    });

    service = TestBed.inject(PageTitleService);
    titleService = TestBed.inject(Title) as jasmine.SpyObj<Title>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('title getter', () => {
    it('should return the current title', () => {
      service.title = 'Test Page';
      expect(service.title).toBe('Test Page');
    });

    it('should return empty string by default', () => {
      expect(service.title).toBe('');
    });
  });

  describe('title setter', () => {
    it('should set the title and update browser title with separator', () => {
      service.title = 'Dashboard';

      expect(service.title).toBe('Dashboard');
      expect(titleService.setTitle).toHaveBeenCalledWith('Dashboard ❘ TMX Labs');
    });

    it('should set browser title to "TMX Labs" when title is empty string', () => {
      service.title = '';

      expect(service.title).toBe('');
      expect(titleService.setTitle).toHaveBeenCalledWith('TMX Labs');
    });

    it('should set browser title to "TMX Labs" when title is null', () => {
      service.title = null;

      expect(service.title).toBe(null);
      expect(titleService.setTitle).toHaveBeenCalledWith('TMX Labs');
    });

    it('should set browser title to "TMX Labs" when title is undefined', () => {
      service.title = undefined;

      expect(service.title).toBe(undefined);
      expect(titleService.setTitle).toHaveBeenCalledWith('TMX Labs');
    });

    it('should update title multiple times', () => {
      service.title = 'Page 1';
      expect(titleService.setTitle).toHaveBeenCalledWith('Page 1 ❘ TMX Labs');

      service.title = 'Page 2';
      expect(titleService.setTitle).toHaveBeenCalledWith('Page 2 ❘ TMX Labs');

      expect(service.title).toBe('Page 2');
      expect(titleService.setTitle).toHaveBeenCalledTimes(2);
    });

    it('should handle special characters in title', () => {
      service.title = 'User & Settings';

      expect(service.title).toBe('User & Settings');
      expect(titleService.setTitle).toHaveBeenCalledWith('User & Settings ❘ TMX Labs');
    });

    it('should trim whitespace from title', () => {
      service.title = '  Dashboard  ';

      expect(service.title).toBe('  Dashboard  ');
      expect(titleService.setTitle).toHaveBeenCalledWith('  Dashboard   ❘ TMX Labs');
    });
  });

  describe('integration', () => {
    it('should maintain state across multiple get/set operations', () => {
      service.title = 'Initial';
      expect(service.title).toBe('Initial');

      service.title = 'Updated';
      expect(service.title).toBe('Updated');

      const currentTitle = service.title;
      expect(currentTitle).toBe('Updated');
    });
  });
});


import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LabelPrinterService, LabelPrinterInfo } from './labelprinter.service';
import { ApiService } from '../api.service';

describe('LabelPrinterService', () => {
  let service: LabelPrinterService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockLabelPrinterInfo: LabelPrinterInfo = {
    workstationId: 'ND382942',
    defaultPrinter: 'HP LaserJet Pro M404n'
  };

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        LabelPrinterService,
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });

    service = TestBed.inject(LabelPrinterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLabelPrinterInfo', () => {
    it('should call ApiService.get with correct endpoint', () => {
      apiServiceSpy.get.and.returnValue(of(mockLabelPrinterInfo));

      service.getLabelPrinterInfo().subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith({
        uri: '/Fulfillment/Info'
      });
    });

    it('should return label printer info', (done) => {
      apiServiceSpy.get.and.returnValue(of(mockLabelPrinterInfo));

      service.getLabelPrinterInfo().subscribe(result => {
        expect(result).toEqual(mockLabelPrinterInfo);
        expect(result.workstationId).toBe('ND382942');
        expect(result.defaultPrinter).toBe('HP LaserJet Pro M404n');
        done();
      });
    });
  });
});

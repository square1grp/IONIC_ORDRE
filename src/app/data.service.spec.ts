import { TestBed } from '@angular/core/testing';

import { Data } from './data.service';

describe('Data', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: Data = TestBed.get(Data);
        expect(service).toBeTruthy();
    });
});

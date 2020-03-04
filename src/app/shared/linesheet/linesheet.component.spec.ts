import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinesheetComponent } from './linesheet.component';

describe('LinesheetComponent', () => {
	let component: LinesheetComponent;
	let fixture: ComponentFixture<LinesheetComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ LinesheetComponent ],
		schemas: [CUSTOM_ELEMENTS_SCHEMA],
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LinesheetComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinesheetPage } from './linesheet.page';

describe('LinesheetPage', () => {
	let component: LinesheetPage;
	let fixture: ComponentFixture<LinesheetPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ LinesheetPage ],
		schemas: [CUSTOM_ELEMENTS_SCHEMA],
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LinesheetPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

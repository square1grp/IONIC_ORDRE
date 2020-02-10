import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { View360Component } from './view360.component';

describe('View360Component', () => {
	let component: View360Component;
	let fixture: ComponentFixture<View360Component>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ View360Component ],
		schemas: [CUSTOM_ELEMENTS_SCHEMA],
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(View360Component);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

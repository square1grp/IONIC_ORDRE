import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionPage } from './collection.page';

describe('CollectionPage', () => {
	let component: CollectionPage;
	let fixture: ComponentFixture<CollectionPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ CollectionPage ],
		schemas: [CUSTOM_ELEMENTS_SCHEMA],
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CollectionPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

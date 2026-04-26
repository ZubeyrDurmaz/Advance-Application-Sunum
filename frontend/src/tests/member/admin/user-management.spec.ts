import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserManagement } from '../../../app/features/member/admin/user-management/user-management';
import { AuthService } from '../../../app/core/services/auth.service';
import { CartService } from '../../../app/core/services/cart.service';
import { ResponsiveService } from '../../../app/core/services/responsive.service';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

describe.skip('UserManagement Component', () => {
  let component: UserManagement;
  let fixture: ComponentFixture<UserManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagement],
      providers: [
        provideRouter([]),
        ResponsiveService,
        {
          provide: CartService,
          useValue: {
            cartItems: signal([]),
            itemCount: computed(() => 0),
            total: computed(() => 0)
          }
        },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(null),
            isLoggedIn: () => false,
            initials: () => '',
            logout: () => {}
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the user-management component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize searchQuery as empty string', () => {
    expect(component.searchQuery()).toBe('');
  });

  it('should initialize filterRole as "all"', () => {
    expect(component.filterRole()).toBe('all');
  });

  it('should initialize selectedUser as null', () => {
    expect(component.selectedUser).toBeNull();
  });

  it('should have users signal with initial data', () => {
    expect(component.users()).toBeDefined();
    expect(component.users().length).toBeGreaterThan(0);
  });

  it('should have correct user structure', () => {
    const user = component.users()[0];
    expect(user.id).toBeDefined();
    expect(user.name).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.role).toBeDefined();
    expect(user.status).toBeDefined();
    expect(user.joined).toBeDefined();
    expect(user.lastLogin).toBeDefined();
  });

  describe('filtered computed', () => {
    it('should return all users when no filter is applied', () => {
      expect(component.filtered().length).toBe(component.users().length);
    });

    it('should filter users by search query (name)', () => {
      component.searchQuery.set('Elena');
      const results = component.filtered();
      expect(results.every(u => u.name.toLowerCase().includes('elena'))).toBe(true);
    });

    it('should filter users by search query (email)', () => {
      component.searchQuery.set('corporate@chronos');
      const results = component.filtered();
      expect(results.length).toBe(1);
      expect(results[0].email).toContain('corporate@chronos');
    });

    it('should filter users by role', () => {
      component.filterRole.set('CORPORATE');
      const results = component.filtered();
      expect(results.every(u => u.role === 'CORPORATE')).toBe(true);
    });

    it('should combine search and role filters', () => {
      component.filterRole.set('INDIVIDUAL');
      component.searchQuery.set('Elena');
      const results = component.filtered();
      expect(results.every(u => u.role === 'INDIVIDUAL' && u.name.toLowerCase().includes('elena'))).toBe(true);
    });
  });

  describe('updateStatus()', () => {
    it('should update user status', () => {
      const user = component.users()[0];
      component.updateStatus(user.id, 'suspended');
      const updated = component.users().find(u => u.id === user.id);
      expect(updated!.status).toBe('suspended');
    });

    it('should update selectedUser status if it matches', () => {
      const user = component.users()[0];
      component.selectedUser = { ...user };
      component.updateStatus(user.id, 'suspended');
      expect(component.selectedUser!.status).toBe('suspended');
    });
  });

  describe('updateRole()', () => {
    it('should update user role', () => {
      const user = component.users()[0];
      component.updateRole(user.id, 'CORPORATE');
      const updated = component.users().find(u => u.id === user.id);
      expect(updated!.role).toBe('CORPORATE');
    });

    it('should update selectedUser role if it matches', () => {
      const user = component.users()[0];
      component.selectedUser = { ...user };
      component.updateRole(user.id, 'ADMIN');
      expect(component.selectedUser!.role).toBe('ADMIN');
    });
  });

  describe('Template', () => {
    it('should render navbar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navbar = compiled.querySelector('app-navbar');
      expect(navbar).toBeTruthy();
    });
  });
});

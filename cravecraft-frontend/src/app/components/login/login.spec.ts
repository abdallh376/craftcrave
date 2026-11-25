
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { LoginComponent } from './login';
import { ApiService } from '../../services/api.service';

describe('LoginComponent', () => {
  let component: LoginComponent;

  let apiServiceMock: {
    adminLogin: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let translateMock: {
    instant: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    localStorage.clear();

    apiServiceMock = {
      adminLogin: vi.fn()
    };

    routerMock = {
      navigate: vi.fn()
    };

    translateMock = {
      instant: vi.fn((key: string) => key)
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: TranslateService, useValue: translateMock },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
      .overrideComponent(LoginComponent, {
        set: {
          template: '',
          imports: []
        }
      })
      .compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty values', () => {
    expect(component.username).toBe('');
    expect(component.password).toBe('');
    expect(component.errorMessage).toBe('');
  });

  it('should login successfully with token', () => {
    apiServiceMock.adminLogin.mockReturnValue(
      of({ token: 'test-token' })
    );

    component.username = 'admin';
    component.password = '123456';

    component.onLogin();

    expect(apiServiceMock.adminLogin).toHaveBeenCalledWith({
      username: 'admin',
      password: '123456'
    });

    expect(localStorage.getItem('isManagerLoggedIn')).toBe('true');
    expect(localStorage.getItem('managerToken')).toBe('test-token');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should login with accessToken', () => {
    apiServiceMock.adminLogin.mockReturnValue(
      of({ accessToken: 'access-token' })
    );

    component.onLogin();

    expect(localStorage.getItem('managerToken')).toBe('access-token');
  });

  it('should login with nested token', () => {
    apiServiceMock.adminLogin.mockReturnValue(
      of({ data: { token: 'nested-token' } })
    );

    component.onLogin();

    expect(localStorage.getItem('managerToken')).toBe('nested-token');
  });

  it('should show error when token is missing', () => {
    apiServiceMock.adminLogin.mockReturnValue(of({}));

    component.onLogin();

    expect(component.errorMessage).toBe('login.noToken');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should show API error message', () => {
    apiServiceMock.adminLogin.mockReturnValue(
      throwError(() => ({
        error: { message: 'Invalid username or password' }
      }))
    );

    component.onLogin();

    expect(component.errorMessage).toBe(
      'Invalid username or password'
    );
  });

  it('should show translated error if API message is missing', () => {
    apiServiceMock.adminLogin.mockReturnValue(
      throwError(() => ({ error: {} }))
    );

    component.onLogin();

    expect(component.errorMessage).toBe('login.invalid');
  });

  it('should redirect if manager is already logged in', () => {
    localStorage.setItem('isManagerLoggedIn', 'true');

    component.ngOnInit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});

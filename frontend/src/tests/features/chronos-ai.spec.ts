import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChronosAi } from '../../app/features/chronos-ai/chronos-ai';
import { AuthService } from '../../app/core/services/auth.service';
import { CartService } from '../../app/core/services/cart.service';
import { ResponsiveService } from '../../app/core/services/responsive.service';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ChronosAi Component', () => {
  let component: ChronosAi;
  let fixture: ComponentFixture<ChronosAi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChronosAi],
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

    fixture = TestBed.createComponent(ChronosAi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the chronos-ai component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty inputText', () => {
    expect(component.inputText).toBe('');
  });

  it('should initialize with isTyping false', () => {
    expect(component.isTyping).toBe(false);
  });

  it('should have initial messages loaded', () => {
    expect(component.messages).toBeDefined();
    expect(component.messages.length).toBeGreaterThan(0);
  });

  it('should have suggestions defined', () => {
    expect(component.suggestions).toBeDefined();
    expect(component.suggestions.length).toBeGreaterThan(0);
  });

  describe('onSend()', () => {
    it('should not send empty messages', () => {
      const initialCount = component.messages.length;
      component.inputText = '   ';
      component.onSend();
      expect(component.messages.length).toBe(initialCount);
    });

    it('should add user message to messages array', () => {
      const initialCount = component.messages.length;
      component.inputText = 'Tell me about Calatrava history';
      component.onSend();
      expect(component.messages.length).toBe(initialCount + 1);
      expect(component.messages[component.messages.length - 1].role).toBe('user');
      expect(component.messages[component.messages.length - 1].text).toBe('Tell me about Calatrava history');
    });

    it('should clear inputText after sending', () => {
      component.inputText = 'Test message';
      component.onSend();
      expect(component.inputText).toBe('');
    });

    it('should set isTyping to true while waiting for AI response', () => {
      component.inputText = 'Test message';
      component.onSend();
      expect(component.isTyping).toBe(true);
    });

    it('should add AI response after delay', async () => {
      const initialCount = component.messages.length;
      component.inputText = 'vintage leather under 20000';
      component.onSend();

      await new Promise(resolve => setTimeout(resolve, 1300));

      // Should have user message + AI response
      expect(component.messages.length).toBeGreaterThan(initialCount + 1);
      expect(component.isTyping).toBe(false);
    });
  });

  describe('onSuggestion()', () => {
    it('should call onSend after setting inputText', () => {
      const sendSpy = vi.spyOn(component, 'onSend');
      component.onSuggestion('Tell me about Calatrava history');
      // onSend is called which clears inputText — just verify it was called
      expect(sendSpy).toHaveBeenCalled();
    });
  });

  describe('onDetails()', () => {
    it('should call onSend with watch name in message', () => {
      const sendSpy = vi.spyOn(component, 'onSend');
      const watch = { name: 'Patek Philippe Calatrava', ref: 'Ref. 5119G-001', price: '$18,500', image: '' };
      component.onDetails(watch);
      expect(sendSpy).toHaveBeenCalled();
    });
  });

  describe('AI response matching', () => {
    it('should return vintage recommendations for vintage keywords', async () => {
      component.inputText = 'vintage leather under 20000';
      component.onSend();

      await new Promise(resolve => setTimeout(resolve, 1300));

      const lastMessage = component.messages[component.messages.length - 1];
      expect(lastMessage.role).toBe('ai');
      expect(lastMessage.recommendations).toBeDefined();
    });

    it('should return fallback response for unknown queries', async () => {
      component.inputText = 'something completely unrelated xyz123';
      component.onSend();

      await new Promise(resolve => setTimeout(resolve, 1300));

      const lastMessage = component.messages[component.messages.length - 1];
      expect(lastMessage.role).toBe('ai');
      expect(lastMessage.text).toContain('fascinating');
    });
  });

  describe('Template', () => {
    it('should render navbar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navbar = compiled.querySelector('app-navbar');
      expect(navbar).toBeTruthy();
    });

    it('should render chat input area', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('input, textarea');
      expect(input).toBeTruthy();
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';
import { UserFeedbackService } from './user-feedback.service';

describe('UserFeedbackService', () => {
  let service: UserFeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(UserFeedbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have null error message', () => {
      expect(service.errorMessage()).toBeNull();
    });

    it('should have null success message', () => {
      expect(service.successMessage()).toBeNull();
    });

    it('should have false loading state', () => {
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('error message management', () => {
    it('should set error message', () => {
      service.setErrorMessage('Test error');
      expect(service.errorMessage()).toBe('Test error');
    });

    it('should clear success message when setting error message', () => {
      service.setSuccessMessage('Success message');
      service.setErrorMessage('Error message');
      
      expect(service.errorMessage()).toBe('Error message');
      expect(service.successMessage()).toBeNull();
    });
  });

  describe('success message management', () => {
    it('should set success message', () => {
      service.setSuccessMessage('Test success');
      expect(service.successMessage()).toBe('Test success');
    });

    it('should clear error message when setting success message', () => {
      service.setErrorMessage('Error message');
      service.setSuccessMessage('Success message');
      
      expect(service.successMessage()).toBe('Success message');
      expect(service.errorMessage()).toBeNull();
    });
  });

  describe('loading state management', () => {
    it('should set loading state to true', () => {
      service.setLoadingState(true);
      expect(service.isLoading()).toBe(true);
    });

    it('should set loading state to false', () => {
      service.setLoadingState(false);
      expect(service.isLoading()).toBe(false);
    });

    it('should toggle loading state', () => {
      service.setLoadingState(true);
      expect(service.isLoading()).toBe(true);

      service.setLoadingState(false);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('clear messages', () => {
    it('should clear all messages', () => {
      service.setErrorMessage('Test error');
      service.setSuccessMessage('Test success');
      
      service.clearMessages();
      
      expect(service.errorMessage()).toBeNull();
      expect(service.successMessage()).toBeNull();
    });

    it('should clear messages when none are set', () => {
      service.clearMessages();
      
      expect(service.errorMessage()).toBeNull();
      expect(service.successMessage()).toBeNull();
    });
  });

  describe('auto-clearing success messages', () => {
    beforeEach(() => {
      // Mock setTimeout and clearTimeout for testing
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should auto-clear success message after 3 seconds', () => {
      service.setSuccessMessage('Test message');
      expect(service.successMessage()).toBe('Test message');

      // Fast-forward time by 3 seconds
      vi.advanceTimersByTime(3000);

      expect(service.successMessage()).toBeNull();
    });

    it('should not auto-clear success message before 3 seconds', () => {
      service.setSuccessMessage('Test message');
      expect(service.successMessage()).toBe('Test message');

      // Fast-forward time by 2.9 seconds
      vi.advanceTimersByTime(2900);

      expect(service.successMessage()).toBe('Test message');
    });

    it('should use window.setTimeout for proper typing', () => {
      const windowSetTimeoutSpy = vi.spyOn(window, 'setTimeout');

      service.setSuccessMessage('Test message');

      expect(windowSetTimeoutSpy).toHaveBeenCalledWith(
        expect.any(Function),
        3000
      );
    });
  });

  describe('memory management', () => {
    beforeEach(() => {
      // Mock setTimeout and clearTimeout for testing
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should clear existing timeout when setting new success message', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      // Set first success message
      service.setSuccessMessage('First message');
      expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
      expect(clearTimeoutSpy).not.toHaveBeenCalled();

      // Set second success message - should clear first timeout
      service.setSuccessMessage('Second message');
      expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);

      expect(service.successMessage()).toBe('Second message');
    });

    it('should clear timeout on service destruction', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      // Set success message to create timeout
      service.setSuccessMessage('Test message');
      expect(service.successMessage()).toBe('Test message');

      // Call ngOnDestroy
      service.ngOnDestroy();
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle ngOnDestroy when no timeout is set', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      // Call ngOnDestroy without setting any message
      service.ngOnDestroy();
      expect(clearTimeoutSpy).not.toHaveBeenCalled();
    });

    it('should clear timeout when clearing messages', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      // Set success message to create timeout
      service.setSuccessMessage('Test message');
      expect(service.successMessage()).toBe('Test message');

      // Clear messages should clear timeout
      service.clearMessages();
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
      expect(service.successMessage()).toBeNull();
    });

    it('should prevent memory leaks with rapid successive calls', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      // Rapidly set multiple success messages
      service.setSuccessMessage('Message 1');
      service.setSuccessMessage('Message 2');
      service.setSuccessMessage('Message 3');
      service.setSuccessMessage('Message 4');

      // Should have called setTimeout 4 times and clearTimeout 3 times
      expect(setTimeoutSpy).toHaveBeenCalledTimes(4);
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(3);

      // Only the last message should be visible
      expect(service.successMessage()).toBe('Message 4');

      // Fast-forward and verify only one timeout fires
      vi.advanceTimersByTime(3000);
      expect(service.successMessage()).toBeNull();
    });

    it('should clear timeout ID after timeout completes naturally', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      service.setSuccessMessage('Test message');
      expect(service.successMessage()).toBe('Test message');

      // Fast-forward time by 3 seconds to let timeout complete
      vi.advanceTimersByTime(3000);
      expect(service.successMessage()).toBeNull();

      // Now calling ngOnDestroy should not call clearTimeout since ID is already cleared
      service.ngOnDestroy();
      expect(clearTimeoutSpy).not.toHaveBeenCalled();
    });

    it('should clear timeout when setting error message', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      // Set success message to create timeout
      service.setSuccessMessage('Success message');
      expect(service.successMessage()).toBe('Success message');

      // Set error message should clear timeout
      service.setErrorMessage('Error message');
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
      expect(service.successMessage()).toBeNull();
      expect(service.errorMessage()).toBe('Error message');
    });
  });

  describe('signal reactivity', () => {
    it('should trigger signal updates when error message changes', () => {
      const errorSignal = service.errorMessage;
      let signalValue = errorSignal();

      expect(signalValue).toBeNull();

      service.setErrorMessage('Test error');
      signalValue = errorSignal();
      expect(signalValue).toBe('Test error');

      service.clearMessages();
      signalValue = errorSignal();
      expect(signalValue).toBeNull();
    });

    it('should trigger signal updates when success message changes', () => {
      const successSignal = service.successMessage;
      let signalValue = successSignal();

      expect(signalValue).toBeNull();

      service.setSuccessMessage('Test success');
      signalValue = successSignal();
      expect(signalValue).toBe('Test success');

      service.clearMessages();
      signalValue = successSignal();
      expect(signalValue).toBeNull();
    });

    it('should trigger signal updates when loading state changes', () => {
      const loadingSignal = service.isLoading;
      let signalValue = loadingSignal();

      expect(signalValue).toBe(false);

      service.setLoadingState(true);
      signalValue = loadingSignal();
      expect(signalValue).toBe(true);

      service.setLoadingState(false);
      signalValue = loadingSignal();
      expect(signalValue).toBe(false);
    });
  });

  describe('interface compliance', () => {
    it('should implement IUserFeedbackService interface', () => {
      // Test that all interface methods are present and callable
      expect(typeof service.setErrorMessage).toBe('function');
      expect(typeof service.setSuccessMessage).toBe('function');
      expect(typeof service.setLoadingState).toBe('function');
      expect(typeof service.clearMessages).toBe('function');

      // Test that all interface properties are present and readable
      expect(typeof service.errorMessage).toBe('function');
      expect(typeof service.successMessage).toBe('function');
      expect(typeof service.isLoading).toBe('function');
    });

    it('should have readonly signals', () => {
      // Signals should be callable (functions) but not writable
      expect(typeof service.errorMessage).toBe('function');
      expect(typeof service.successMessage).toBe('function');
      expect(typeof service.isLoading).toBe('function');

      // These should not have .set methods (readonly)
      expect('set' in service.errorMessage).toBe(false);
      expect('set' in service.successMessage).toBe(false);
      expect('set' in service.isLoading).toBe(false);
    });
  });
});
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi, expect } from 'vitest';
import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
  let service: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(ConfirmationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('confirm', () => {
    it('should call window.confirm with the provided message', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const message = 'Are you sure?';

      service.confirm(message);

      expect(confirmSpy).toHaveBeenCalledWith(message);
      confirmSpy.mockRestore();
    });

    it('should return true when user confirms', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      const result = service.confirm('Test message');

      expect(result).toBe(true);
      confirmSpy.mockRestore();
    });

    it('should return false when user cancels', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      const result = service.confirm('Test message');

      expect(result).toBe(false);
      confirmSpy.mockRestore();
    });

    it('should handle empty message', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      service.confirm('');

      expect(confirmSpy).toHaveBeenCalledWith('');
      confirmSpy.mockRestore();
    });

    it('should handle long message', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const longMessage = 'This is a very long confirmation message that contains a lot of text and should still work properly';

      service.confirm(longMessage);

      expect(confirmSpy).toHaveBeenCalledWith(longMessage);
      confirmSpy.mockRestore();
    });

    it('should handle special characters in message', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const specialMessage = 'Are you sure? This has "quotes" and <tags> and & symbols!';

      service.confirm(specialMessage);

      expect(confirmSpy).toHaveBeenCalledWith(specialMessage);
      confirmSpy.mockRestore();
    });
  });
});
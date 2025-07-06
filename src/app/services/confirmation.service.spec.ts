import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi, expect } from 'vitest';
import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
  let service: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ConfirmationService
      ]
    });
    service = TestBed.inject(ConfirmationService);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('confirmDelete', () => {
    let confirmSpy: vi.SpyInstance;

    beforeEach(() => {
      confirmSpy = vi.spyOn(window, 'confirm');
    });

    afterEach(() => {
      confirmSpy.mockRestore();
    });

    describe('Basic Confirmation Dialog', () => {
      it('should return true when user confirms deletion', async () => {
        confirmSpy.mockReturnValue(true);

        const result = await service.confirmDelete();

        expect(result).toBe(true);
        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this item?');
      });

      it('should return false when user cancels deletion', async () => {
        confirmSpy.mockReturnValue(false);

        const result = await service.confirmDelete();

        expect(result).toBe(false);
        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this item?');
      });
    });

    describe('Custom Message Confirmation', () => {
      it('should show custom message when provided', async () => {
        confirmSpy.mockReturnValue(true);
        const customMessage = 'Are you sure you want to delete this todo?';

        const result = await service.confirmDelete(customMessage);

        expect(result).toBe(true);
        expect(confirmSpy).toHaveBeenCalledWith(customMessage);
      });

      it('should handle empty custom message', async () => {
        confirmSpy.mockReturnValue(false);

        const result = await service.confirmDelete('');

        expect(result).toBe(false);
        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this item?');
      });

      it('should handle null custom message', async () => {
        confirmSpy.mockReturnValue(true);

        const result = await service.confirmDelete(null as unknown as string);

        expect(result).toBe(true);
        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this item?');
      });

      it('should handle undefined custom message', async () => {
        confirmSpy.mockReturnValue(false);

        const result = await service.confirmDelete(undefined);

        expect(result).toBe(false);
        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this item?');
      });
    });

    describe('Todo-specific Confirmation', () => {
      it('should show todo-specific message when todo title provided', async () => {
        confirmSpy.mockReturnValue(true);
        const todoTitle = 'Complete project documentation';

        const result = await service.confirmDelete(`Are you sure you want to delete "${todoTitle}"?`);

        expect(result).toBe(true);
        expect(confirmSpy).toHaveBeenCalledWith(`Are you sure you want to delete "${todoTitle}"?`);
      });

      it('should handle very long todo titles gracefully', async () => {
        confirmSpy.mockReturnValue(false);
        const longTitle = 'a'.repeat(200);
        const message = `Are you sure you want to delete "${longTitle}"?`;

        const result = await service.confirmDelete(message);

        expect(result).toBe(false);
        expect(confirmSpy).toHaveBeenCalledWith(message);
      });
    });

    describe('Error Handling', () => {
      it('should handle confirm function throwing an error', async () => {
        confirmSpy.mockImplementation(() => {
          throw new Error('Browser confirmation failed');
        });

        const result = await service.confirmDelete();

        expect(result).toBe(false); // Should default to false on error
      });

      it('should handle confirm function returning undefined', async () => {
        confirmSpy.mockReturnValue(undefined as unknown as boolean);

        const result = await service.confirmDelete();

        expect(result).toBe(false); // Should treat undefined as false
      });

      it('should handle confirm function returning null', async () => {
        confirmSpy.mockReturnValue(null as unknown as boolean);

        const result = await service.confirmDelete();

        expect(result).toBe(false); // Should treat null as false
      });
    });

    describe('Browser Environment Handling', () => {
      it('should handle missing window object gracefully', async () => {
        // Mock window as undefined (SSR scenario)
        const originalWindow = global.window;
        (global as Record<string, unknown>).window = undefined;

        const result = await service.confirmDelete();

        expect(result).toBe(false); // Should default to false when no window

        // Restore window
        global.window = originalWindow;
      });

      it('should handle missing confirm function gracefully', async () => {
        // Mock confirm as undefined
        const originalConfirm = window.confirm;
        (window as Record<string, unknown>).confirm = undefined;

        const result = await service.confirmDelete();

        expect(result).toBe(false); // Should default to false when no confirm function

        // Restore confirm
        window.confirm = originalConfirm;
      });
    });
  });

  describe('confirmDeleteTodo', () => {
    let confirmSpy: vi.SpyInstance;

    beforeEach(() => {
      confirmSpy = vi.spyOn(window, 'confirm');
    });

    afterEach(() => {
      confirmSpy.mockRestore();
    });

    it('should show specific todo deletion message', async () => {
      confirmSpy.mockReturnValue(true);
      const todoTitle = 'Complete Angular refactoring';

      const result = await service.confirmDeleteTodo(todoTitle);

      expect(result).toBe(true);
      expect(confirmSpy).toHaveBeenCalledWith(`Are you sure you want to delete "${todoTitle}"?`);
    });

    it('should handle empty todo title', async () => {
      confirmSpy.mockReturnValue(false);

      const result = await service.confirmDeleteTodo('');

      expect(result).toBe(false);
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
    });

    it('should handle null todo title', async () => {
      confirmSpy.mockReturnValue(true);

      const result = await service.confirmDeleteTodo(null as unknown as string);

      expect(result).toBe(true);
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
    });

    it('should handle undefined todo title', async () => {
      confirmSpy.mockReturnValue(false);

      const result = await service.confirmDeleteTodo(undefined);

      expect(result).toBe(false);
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
    });

    it('should trim whitespace from todo title', async () => {
      confirmSpy.mockReturnValue(true);
      const todoTitle = '  Complete project setup  ';

      const result = await service.confirmDeleteTodo(todoTitle);

      expect(result).toBe(true);
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete "Complete project setup"?');
    });
  });

  describe('Future Extension Points', () => {
    it('should be extensible for UI-based confirmation dialogs', () => {
      // This test documents that the service is designed to be extended
      // for future UI-based confirmation dialogs instead of browser alerts
      expect(service.confirmDelete).toBeDefined();
      expect(service.confirmDeleteTodo).toBeDefined();
      expect(typeof service.confirmDelete).toBe('function');
      expect(typeof service.confirmDeleteTodo).toBe('function');
    });

    it('should support async confirmation workflows', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      const result = await service.confirmDelete();

      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');
      
      confirmSpy.mockRestore();
    });
  });
});
import { Page, Locator, expect } from '@playwright/test';

export interface FormValidationState {
  titleValid: boolean;
  dueDateValid: boolean;
  formValid: boolean;
}

/**
 * Page Object Model for Todo Form interactions
 * Specialized for form validation, field interactions, and tag management
 */
export class TodoFormPage {
  readonly page: Page;
  
  // Form container
  readonly form: Locator;
  
  // Input fields
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly prioritySelect: Locator;
  readonly dueDateInput: Locator;
  readonly tagInput: Locator;
  
  // Form controls
  readonly submitButton: Locator;
  
  // Error messages
  readonly titleError: Locator;
  readonly dueDateError: Locator;
  readonly tagError: Locator;
  
  // Tag management
  readonly tagsContainer: Locator;
  readonly tagChips: Locator;
  readonly removeTagButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.form = page.getByTestId('add-todo-form');
    
    // Input fields
    this.titleInput = page.getByTestId('title-input');
    this.descriptionInput = page.getByTestId('description-input');
    this.prioritySelect = page.getByTestId('priority-select');
    this.dueDateInput = page.getByTestId('due-date-input');
    this.tagInput = page.getByTestId('tag-input');
    
    // Form controls
    this.submitButton = page.getByTestId('submit-button');
    
    // Error messages
    this.titleError = page.getByTestId('title-error');
    this.dueDateError = page.getByTestId('due-date-error');
    this.tagError = page.getByTestId('tag-error');
    
    // Tag management
    this.tagsContainer = page.getByTestId('tags-container');
    this.tagChips = page.getByTestId('tag-chip');
    this.removeTagButtons = page.getByTestId('remove-tag-button');
  }

  /**
   * Wait for form to be visible and ready for interaction
   */
  async waitForFormReady() {
    await expect(this.form).toBeVisible();
    await expect(this.titleInput).toBeVisible();
  }

  /**
   * Fill only the title field (minimum required)
   */
  async fillTitle(title: string) {
    await this.titleInput.fill(title);
    await this.waitForValidation();
  }

  /**
   * Fill title and description
   */
  async fillBasicFields(title: string, description?: string) {
    await this.titleInput.fill(title);
    if (description) {
      await this.descriptionInput.fill(description);
    }
    await this.waitForValidation();
  }

  /**
   * Select priority from dropdown
   */
  async selectPriority(priority: 'Low' | 'Medium' | 'High') {
    await this.prioritySelect.selectOption(priority);
  }

  /**
   * Set due date field
   */
  async setDueDate(dateString: string) {
    await this.dueDateInput.fill(dateString);
    await this.waitForValidation();
  }

  /**
   * Add a single tag
   */
  async addTag(tag: string) {
    await this.tagInput.fill(tag);
    await this.tagInput.press('Enter');
  }

  /**
   * Add multiple tags
   */
  async addTags(tags: string[]) {
    for (const tag of tags) {
      await this.addTag(tag);
    }
  }

  /**
   * Remove a tag by index
   */
  async removeTag(index: number) {
    const removeButton = this.removeTagButtons.nth(index);
    await removeButton.click();
  }

  /**
   * Remove all tags
   */
  async removeAllTags() {
    const tagCount = await this.tagChips.count();
    for (let i = tagCount - 1; i >= 0; i--) {
      await this.removeTag(i);
    }
  }

  /**
   * Wait for Angular form validation to complete
   */
  async waitForValidation() {
    await this.page.waitForFunction(() => {
      const form = document.querySelector('[data-testid="add-todo-form"]');
      return form && (form.classList.contains('ng-valid') || form.classList.contains('ng-invalid'));
    });
  }

  /**
   * Wait for submit button to be enabled
   */
  async waitForSubmitEnabled() {
    await expect(this.submitButton).toBeEnabled();
  }

  /**
   * Wait for submit button to be disabled
   */
  async waitForSubmitDisabled() {
    await expect(this.submitButton).toBeDisabled();
  }

  /**
   * Submit the form and wait for completion
   */
  async submitForm() {
    await this.waitForSubmitEnabled();
    await this.submitButton.click();
    
    // Wait for form reset (indicating successful submission)
    await expect(this.titleInput).toHaveValue('');
  }

  /**
   * Try to submit form without waiting for validation
   */
  async attemptSubmit() {
    await this.submitButton.click();
  }

  /**
   * Check if form is currently valid
   */
  async isFormValid() {
    return await this.submitButton.isEnabled();
  }

  /**
   * Get current form validation state
   */
  async getValidationState(): Promise<FormValidationState> {
    return {
      titleValid: !(await this.titleError.isVisible()),
      dueDateValid: !(await this.dueDateError.isVisible()),
      formValid: await this.isFormValid()
    };
  }

  /**
   * Expect form to be valid
   */
  async expectFormValid() {
    await this.waitForValidation();
    await expect(this.submitButton).toBeEnabled();
  }

  /**
   * Expect form to be invalid
   */
  async expectFormInvalid() {
    await this.waitForValidation();
    await expect(this.submitButton).toBeDisabled();
  }

  /**
   * Expect submit button to be disabled
   */
  async expectButtonDisabled() {
    await expect(this.submitButton).toBeDisabled();
  }

  /**
   * Expect submit button to be enabled
   */
  async expectButtonEnabled() {
    await expect(this.submitButton).toBeEnabled();
  }

  /**
   * Focus and blur title input to trigger validation
   */
  async focusAndBlurTitle() {
    await this.titleInput.focus();
    await this.titleInput.blur();
    await this.waitForValidation();
  }

  /**
   * Fill title with only spaces (invalid input)
   */
  async fillSpacesInTitle() {
    await this.titleInput.fill('   '); // Just spaces
    await this.waitForValidation();
  }

  /**
   * Expect title error to be visible
   */
  async expectTitleError() {
    await expect(this.titleError).toBeVisible();
  }

  /**
   * Expect due date error to be visible
   */
  async expectDueDateError() {
    await expect(this.dueDateError).toBeVisible();
  }

  /**
   * Expect tag error to be visible
   */
  async expectTagError() {
    await expect(this.tagError).toBeVisible();
  }

  /**
   * Expect no validation errors
   */
  async expectNoErrors() {
    await expect(this.titleError).not.toBeVisible();
    await expect(this.dueDateError).not.toBeVisible();
    await expect(this.tagError).not.toBeVisible();
  }

  /**
   * Get current form validation state
   */
  async getFormValidationState(): Promise<{
    titleValid: boolean;
    formEnabled: boolean;
    hasErrors: boolean;
  }> {
    const titleErrorVisible = await this.titleError.isVisible();
    const dueDateErrorVisible = await this.dueDateError.isVisible();
    const tagErrorVisible = await this.tagError.isVisible();
    const formEnabled = await this.submitButton.isEnabled();

    return {
      titleValid: !titleErrorVisible,
      formEnabled,
      hasErrors: titleErrorVisible || dueDateErrorVisible || tagErrorVisible
    };
  }

  /**
   * Expect specific form state
   */
  async expectFormState(expected: {
    enabled?: boolean;
    titleError?: boolean;
    dueDateError?: boolean;
    tagError?: boolean;
  }) {
    if (expected.enabled !== undefined) {
      if (expected.enabled) {
        await this.expectButtonEnabled();
      } else {
        await this.expectButtonDisabled();
      }
    }
    
    if (expected.titleError) {
      await this.expectTitleError();
    }
    
    if (expected.dueDateError) {
      await this.expectDueDateError();
    }

    if (expected.tagError) {
      await this.expectTagError();
    }
  }

  /**
   * Get the number of current tags
   */
  async getTagCount() {
    return await this.tagChips.count();
  }

  /**
   * Expect specific number of tags
   */
  async expectTagCount(count: number) {
    await expect(this.tagChips).toHaveCount(count);
  }

  /**
   * Expect tag with specific text to be visible
   */
  async expectTag(tagText: string) {
    await expect(this.tagChips.filter({ hasText: tagText })).toBeVisible();
  }

  /**
   * Clear all form fields
   */
  async clearForm() {
    await this.titleInput.clear();
    await this.descriptionInput.clear();
    await this.dueDateInput.clear();
    await this.removeAllTags();
  }

  /**
   * Trigger validation by focusing and blurring title field
   */
  async triggerTitleValidation() {
    await this.titleInput.focus();
    await this.descriptionInput.focus(); // Blur title field
    await this.waitForValidation();
  }

  /**
   * Trigger validation by focusing and blurring due date field
   */
  async triggerDueDateValidation() {
    await this.dueDateInput.focus();
    await this.titleInput.focus(); // Blur due date field
    await this.waitForValidation();
  }
}
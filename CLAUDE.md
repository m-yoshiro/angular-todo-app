# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Quality Standards

### Expert Panel Consensus
Based on expert software architecture review:

#### Critical Architectural Issues
1. **Single Responsibility Violation**: Components mixing presentation and business logic
2. **Testability Problems**: Direct dependencies on browser APIs (confirm, localStorage)
3. **Boundary Violations**: Business logic scattered across components

#### Smart Service, Dumb Component Policy (MANDATORY)
- **Services**: Own ALL business logic, validation, error handling, side effects
- **Components**: ONLY presentation logic and event delegation
- **No Exceptions**: Components must not contain try/catch, validation, or confirmation logic

#### What Components Cannot Do
- ❌ Input validation or business rule enforcement
- ❌ Direct calls to browser APIs (`confirm`, `alert`, `localStorage`)
- ❌ Error handling with try/catch blocks
- ❌ Console logging for business errors
- ❌ Data manipulation or transformation logic

#### What Components Should Do
- ✅ Render data received from services
- ✅ Delegate user actions to services
- ✅ Handle UI state and presentation logic only
- ✅ Emit events for parent components

### Refactoring Priorities
1. **Move validation logic** from `TodoListComponent.onAddTodo` to `TodoService`
2. **Abstract confirmation dialogs** behind a service interface for testability
3. **Move all error handling** to service layer with proper error propagation
4. **Update component tests** to focus on presentation only

## Development Commands

**Build & Serve:**
- `npm start` - Start development server (http://localhost:4200)
- `npm run dev` - Start development server (alias for start)
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run build:prod` - Build for production (explicit)
- `npm run watch` - Build in watch mode

**Testing (TDD-Focused):**
- `npm run test:watch` - **PRIMARY**: Run tests in watch mode for TDD cycles
- `npm test` - Run unit tests with Vitest
- `npm run test:coverage` - Run tests with coverage report
- Tests use Vitest framework with Angular Testing Utilities
- **TDD Workflow**: Keep `test:watch` running during development

**E2E Testing (Playwright + MCP):**
- `npm run e2e` - **PRIMARY**: Run E2E tests with Playwright (Chrome only, fast)
- `npm run e2e:chrome` - Run E2E tests in Chrome only (same as e2e)
- `npm run e2e:headed` - Run E2E tests in headed mode (visible browser)
- `npm run e2e:debug` - Run E2E tests in debug mode with Playwright inspector
- `npm run e2e:report` - View detailed test results and traces
- **MCP Browser Automation**: Direct browser control for interactive testing
- **MCP Visual Testing**: Screenshot comparison and visual regression detection
- **MCP Performance Testing**: Automated performance metrics collection
- **E2E Tests**: Cover complete user workflows on localhost:4200
- **Test Files**: `e2e/todo-app.spec.ts`, `e2e/todo-form.spec.ts`, `e2e/todo-stats.spec.ts`
- **Scope**: Chrome only for speed (can be expanded later)

**MCP Playwright Integration:**
- **Interactive Testing**: Real-time browser interaction during development
- **Visual Regression**: Automated screenshot comparison for UI changes
- **Performance Monitoring**: Collect Core Web Vitals and performance metrics
- **Multi-browser Testing**: Chrome, Firefox, Safari support via MCP
- **Debugging**: Enhanced debugging with MCP browser inspection tools

**Test Command Rules (CRITICAL):**
- ⚠️ **NEVER add extra options** like `-- run`, `-- ci`, or other flags to test commands
- ✅ **Use EXACT commands**: `npm test`, `npm run test:watch`, `npm run test:coverage`
- ❌ **DO NOT use**: `npm test -- run`, `npm run test:watch -- run`, etc.
- This Angular + Vitest setup requires the exact npm scripts as defined in package.json
- Adding extra options will cause test failures

**Code Quality:**
- `npm run lint` - Run ESLint for TypeScript and HTML files
- `npm run lint:fix` - Run ESLint and auto-fix issues
- `npm run check` - Run lint and tests together
- `npm run validate` - Run full validation (lint + test + e2e + build)
- ESLint configured with Angular and TypeScript rules
- Uses angular-eslint, @typescript-eslint packages

**SSR & Production:**
- `npm run serve:ssr` - Serve SSR application
- `npm run clean` - Clean dist folder

**Quality Assurance:**
- `npm run precommit` - Pre-commit checks (lint + test)
- `npm run validate` - Full project validation

## Project Architecture

This is an **Angular 20 TODO application** showcasing modern Angular patterns:

### Key Angular 20 Features Used
- **Standalone Components** (no NgModules)
- **Signals** for reactive state management 
- **Zoneless Change Detection** (experimental)
- **New Control Flow Syntax** (`@for`, `@if`, `@switch`)
- **SSR with Incremental Hydration** (experimental)

### Component Architecture
- All components are standalone (no NgModules)
- Use `inject()` function for dependency injection
- Follow signal-based state management patterns
- Use new template control flow syntax
- **MANDATORY**: Strict separation between presentation and business logic

#### Component Responsibilities
- **Presentation Only**: Components handle UI rendering and user interaction
- **Event Delegation**: Components emit events to parent or delegate to services
- **No Business Logic**: All validation, error handling, and data manipulation in services
- **Testable Design**: Components should be easily testable without mocking business logic

### State Management with Signals
```typescript
// Preferred patterns:
const todos = signal<Todo[]>([]);
const completedTodos = computed(() => todos().filter(todo => todo.completed));
const todoStats = computed(() => ({
  total: todos().length,
  completed: todos().filter(t => t.completed).length
}));
```

### Template Syntax (Angular v20)
```html
<!-- Use new control flow -->
@for (todo of todos(); track todo.id) {
  <app-todo-item [todo]="todo" />
}
@if (todos().length === 0) {
  <p>No todos found</p>
}
```

### Project Structure
```
src/app/
├── components/     # Standalone components
│   ├── todo-list/
│   ├── todo-item/
│   └── add-todo-form/
├── services/       # Injectable services
│   └── todo.service.ts
├── models/         # TypeScript interfaces
│   └── todo.model.ts
└── styles/         # SCSS variables and globals
```

## MCP Tool Integration

This project leverages Claude Code's **Model Context Protocol (MCP)** tools for enhanced development workflows:

### GitHub MCP Integration
- **Repository Management**: Direct GitHub API access for PRs, issues, and commits
- **Branch Operations**: Create, switch, and manage branches programmatically
- **PR Workflows**: Automated PR creation, review, and merge processes
- **Issue Tracking**: Link commits to issues, update status, manage labels
- **Code Review**: Automated review requests and approval workflows

### Playwright MCP Integration  
- **Browser Automation**: Direct browser control for E2E testing
- **Interactive Testing**: Real-time browser interaction during development
- **Visual Testing**: Screenshot comparison and visual regression testing
- **Performance Testing**: Automated performance metrics collection
- **Multi-browser Support**: Chrome, Firefox, Safari testing capabilities

### MCP Usage Patterns
```typescript
// GitHub MCP Examples
// - Create PRs directly from feature branches
// - Automatically link commits to issues
// - Manage review workflows programmatically

// Playwright MCP Examples  
// - Interactive browser testing during development
// - Automated visual regression testing
// - Performance monitoring integration
```

### When to Use MCP vs npm Commands
- **Use MCP Tools**: Repository management, PR workflows, interactive browser testing
- **Use npm Commands**: Build processes, unit testing, local development server
- **Hybrid Approach**: Combine both for comprehensive development workflows

## Development Process

### File Management Guidelines
- **Temporary Files**: Use `/tmp/` directory for all temporary files (diff files, temporary outputs, etc.)
- **No Temporary Files in Project**: Never create temporary files within the project directory
- **Clean Temporary Files**: Remove temporary files after use when possible

### TDD Development Workflow (MANDATORY)
- **Test-Driven Development**: All new features MUST follow TDD methodology
- **TDD Cycle**: Red (failing test) → Green (minimal code) → Refactor → Repeat
- **Before Writing Code**: Always write the test first using `npm run test:watch`
- **Component Development**: Test component behavior, inputs, outputs before implementation
- **Service Development**: Test service methods, signal updates, side effects before coding

### ESLint Quality Gate (MANDATORY)
- **Before Every Implementation**: Run `npm run lint` to check for existing errors
- **During Development**: Run `npm run lint:fix` to auto-fix issues
- **Before Creating PR**: Run `npm run check` (lint + tests) to validate everything
- **Never Proceed**: If ESLint errors exist, fix them before moving to next step
- **Quick Fix Workflow**: `npm run lint:fix` → `npm run lint` → fix remaining manually

### MCP-Enhanced TDD Workflow
- **GitHub MCP Integration**: Automated issue creation for failing tests
- **Playwright MCP Integration**: Interactive browser testing during TDD cycles
- **Visual TDD**: Use MCP browser automation for visual regression testing
- **Performance TDD**: Integrate performance testing into TDD cycles with MCP
- **Automated Documentation**: Generate test documentation via GitHub MCP

### Branch Workflow (MANDATORY)
- **ALWAYS create a new branch** for each task implementation
- **NEVER commit directly to main** branch
- Branch naming: `feature/XX-description` (XX = PR number from roadmap)
- Follow the detailed roadmap in `plans/detailed-roadmap.md`
- **TDD Commits**: Include both test and implementation in each commit

### GitHub MCP Workflow Integration
- **Automated PR Creation**: Use GitHub MCP to create PRs directly from feature branches
- **Issue Management**: Link commits to issues automatically via MCP
- **Review Automation**: Request reviews and manage approval workflows
- **Branch Management**: Create, switch, and manage branches programmatically
- **Status Updates**: Automatically update issue status based on PR progress
- **Merge Workflows**: Automated merge processes with conflict resolution

#### GitHub MCP Commands Integration
```bash
# Example MCP workflows (handled automatically by Claude Code)
# - Create PR: GitHub MCP handles PR creation with proper templates
# - Link Issues: Automatically references issues in commits
# - Review Requests: Automated reviewer assignment based on code changes
# - Status Updates: Real-time status updates for linked issues
# - Merge Automation: Handles merge conflicts and branch cleanup
```

#### Pull Request Automation
- **Template Integration**: Auto-populate PR templates with MCP
- **Reviewer Assignment**: Intelligent reviewer selection based on code changes
- **Status Checks**: Automated status check integration
- **Merge Strategies**: Configurable merge strategies (merge, squash, rebase)
- **Branch Protection**: Enforce branch protection rules via MCP

### Current Development Status
- ✅ Phase 1 completed: Project structure, models, basic setup
- ✅ Phase 2 completed: Core functionality (TodoService, components) using **TDD approach**
- ✅ ESLint setup completed: Code quality tools configured
- ⚠️ **ARCHITECTURAL DEBT**: TodoListComponent violates Single Responsibility Principle
- 🔄 Ready for Phase 3: Advanced features (filtering, persistence, signal forms)
- 🎯 **TDD Success**: Phase 2 achieved 100% test coverage with comprehensive TDD implementation

### Immediate Architecture Improvements Needed
1. **Refactor TodoListComponent**: Move business logic to TodoService
2. **Abstract Browser APIs**: Create confirmation and storage services
3. **Update Tests**: Separate component and service test responsibilities
4. **Enforce Boundaries**: Implement strict component/service separation

### Testing Strategy

#### TDD (Test-Driven Development) Methodology
- **MANDATORY**: Follow Red-Green-Refactor cycle for all new features
  - 🔴 **Red**: Write failing test first
  - 🟢 **Green**: Write minimal code to make test pass
  - 🔵 **Refactor**: Improve code while keeping tests green
- **Test-First Development**: Always write tests before implementation
- **TDD Workflow**: `npm run test:watch` → write test → write code → refactor

#### Testing Framework & Patterns
- **Unit Tests**: Use Angular testing with Vitest (migrated from Karma)
- **Signal Testing**: Test signal interactions and computed values with TDD approach
- **Component Testing**: Mock services, test template bindings, test-driven component development
- **Service Testing**: Test business logic, validation, error handling in services
- **Vitest Features**: Faster execution, native ESM support, better watch mode for TDD cycles
- **Coverage Target**: 90%+ (currently achieving 100% statements, 95%+ branches)

#### Testing Separation of Concerns
- **Component Tests**: Focus on presentation logic, event emission, template rendering
- **Service Tests**: Focus on business logic, validation, error handling, side effects
- **Mock Browser APIs**: Abstract `confirm()`, `localStorage`, etc. behind services for testing
- **No Business Logic in Component Tests**: If component test needs complex mocking, move logic to service

#### TDD Examples for Angular 20
```typescript
// Service TDD Example - Business Logic Testing
describe('TodoService', () => {
  it('should validate todo creation request', () => {
    // Red: Test fails initially
    const service = new TodoService();
    const invalidRequest = { title: '', completed: false };
    
    expect(() => service.addTodo(invalidRequest)).toThrow('Title is required');
  });
  
  it('should handle confirmation for todo deletion', () => {
    // Red: Test confirmation logic
    const service = new TodoService();
    const confirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    
    service.deleteTodo('123', confirmationService);
    
    expect(confirmationService.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
  });
});

// Component TDD Example - Presentation Logic Only
describe('TodoListComponent', () => {
  it('should emit add event when form submits', () => {
    // Red: Write test first
    const fixture = TestBed.createComponent(TodoListComponent);
    const component = fixture.componentInstance;
    spyOn(component, 'onAddTodo');
    
    const formData = { title: 'Test Todo', completed: false };
    component.onAddTodo(formData);
    
    expect(component.onAddTodo).toHaveBeenCalledWith(formData);
  });
  
  it('should display todos from service', () => {
    // Red: Test presentation logic
    const mockTodos = [{ id: '1', title: 'Test', completed: false }];
    const todoService = jasmine.createSpyObj('TodoService', [], { todos: signal(mockTodos) });
    
    const fixture = TestBed.createComponent(TodoListComponent);
    fixture.componentInstance.todoService = todoService;
    fixture.detectChanges();
    
    expect(fixture.nativeElement.textContent).toContain('Test');
  });
});
```

### Styling
- Uses **SCSS** for all styling (configured in angular.json)
- **Tailwind CSS** integrated for utility-first styling
- Component styles: `component-name.component.scss`
- Global styles: `src/styles.scss`
- SCSS variables: `src/styles/variables.scss`
- PostCSS configuration: `.postcssrc.json`

## Todo Model Structure
```typescript
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
}
```

## MCP Tool Usage Guidelines

### Best Practices for MCP Integration

#### GitHub MCP Usage
- **PR Creation**: Use GitHub MCP for automated PR creation with proper templates
- **Issue Management**: Leverage MCP for linking commits to issues automatically
- **Review Workflows**: Automate review requests and approval processes
- **Branch Operations**: Use MCP for programmatic branch management
- **Status Updates**: Real-time status updates for linked issues and PRs

#### Playwright MCP Usage
- **Interactive Testing**: Use MCP for real-time browser interaction during development
- **Visual Regression**: Automated screenshot comparison for UI changes
- **Performance Testing**: Collect Core Web Vitals and performance metrics
- **Debugging**: Enhanced debugging with MCP browser inspection tools
- **Multi-browser Testing**: Chrome, Firefox, Safari support via MCP

#### When to Use MCP vs Traditional Commands

**Use GitHub MCP for:**
- Creating and managing PRs
- Linking commits to issues
- Automating review workflows
- Managing branch operations
- Status updates and notifications

**Use Playwright MCP for:**
- Interactive browser testing
- Visual regression testing
- Performance monitoring
- Cross-browser testing
- Real-time debugging

**Use npm Commands for:**
- Build processes (`npm run build`)
- Unit testing (`npm test`)
- Development server (`npm start`)
- Linting (`npm run lint`)
- Local development workflows

#### Troubleshooting MCP Integration
- **GitHub API Limits**: Monitor API rate limits for GitHub MCP operations
- **Browser Session Management**: Handle browser session timeouts in Playwright MCP
- **Network Issues**: Implement retry logic for MCP network operations
- **Permission Issues**: Ensure proper GitHub permissions for MCP operations
- **Performance Optimization**: Use MCP efficiently to avoid unnecessary API calls

## Important Files to Reference
- `plans/detailed-roadmap.md` - Complete 6-week development plan with PRs
- `src/app/models/todo.model.ts` - Core data interfaces
- `angular.json` - Angular CLI configuration (SCSS, SSR, lint setup)
- `eslint.config.js` - ESLint configuration for TypeScript and Angular
- `.cursor/rules/` - Development guidelines and architectural patterns

## Current Phase Focus
**Phase 2 Completed** - All core functionality implemented with TDD methodology:
- ✅ PR #4: Todo Item Component (completed with comprehensive tests)
- ✅ PR #5: Add Todo Form Component (completed - broken into sub-issues #16-19)
  - ✅ Issue #16: Basic Form Structure and Validation
  - ✅ Issue #17: Priority and Due Date Fields  
  - ✅ Issue #18: Tag Management System
  - ✅ Issue #19: Form Integration and Events
- ✅ PR #6: Component Integration (ready for implementation)

**Now Ready for Phase 3 (Week 3)** - Advanced features using **proven TDD approach**:
- PR #7: Todo Filtering & Statistics
- PR #8: Local Storage Persistence  
- PR #9: Signal-based Forms (Experimental)

### TDD Development Success from Phase 2
- **Achieved 100% test coverage** with 923 comprehensive test cases
- **Perfect Red-Green-Refactor cycles** for each component feature
- **Advanced signal testing patterns** successfully implemented
- **Production-ready component architecture** with Angular 20 patterns
- All acceptance criteria met for Phase 2 components
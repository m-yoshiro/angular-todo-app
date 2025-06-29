# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- `npm run validate` - Run full validation (lint + test + build)
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

### Branch Workflow (MANDATORY)
- **ALWAYS create a new branch** for each task implementation
- **NEVER commit directly to main** branch
- Branch naming: `feature/XX-description` (XX = PR number from roadmap)
- Follow the detailed roadmap in `plans/detailed-roadmap.md`
- **TDD Commits**: Include both test and implementation in each commit

### Current Development Status
- ✅ Phase 1 completed: Project structure, models, basic setup
- ✅ Phase 2 completed: Core functionality (TodoService, components) using **TDD approach**
- ✅ ESLint setup completed: Code quality tools configured
- 🔄 Ready for Phase 3: Advanced features (filtering, persistence, signal forms)
- 🎯 **TDD Success**: Phase 2 achieved 100% test coverage with comprehensive TDD implementation

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
- **Vitest Features**: Faster execution, native ESM support, better watch mode for TDD cycles
- **Coverage Target**: 90%+ (currently achieving 100% statements, 95%+ branches)

#### TDD Examples for Angular 20
```typescript
// Signal TDD Example - TodoService
describe('TodoService', () => {
  it('should add new todo when calling addTodo', () => {
    // Red: Test fails initially
    const service = new TodoService();
    const newTodo = { title: 'Test Todo', completed: false };
    
    service.addTodo(newTodo);
    
    expect(service.todos()).toContain(jasmine.objectContaining(newTodo));
  });
});

// Component TDD Example - TodoListComponent
describe('TodoListComponent', () => {
  it('should display empty state when no todos exist', () => {
    // Red: Write test first
    const fixture = TestBed.createComponent(TodoListComponent);
    component.todos.set([]);
    fixture.detectChanges();
    
    expect(fixture.nativeElement.textContent).toContain('No todos found');
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
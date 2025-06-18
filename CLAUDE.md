# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Build & Serve:**
- `ng serve` - Start development server (http://localhost:4200)
- `ng build` - Build for production
- `ng build --watch --configuration development` - Build in watch mode

**Testing:**
- `ng test` - Run unit tests with Karma
- `ng test --code-coverage` - Run tests with coverage report
- Tests use Jasmine framework with Angular Testing Utilities

**Code Quality:**
- `ng lint` - Run ESLint for TypeScript and HTML files
- ESLint configured with Angular and TypeScript rules
- Uses angular-eslint, @typescript-eslint packages

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

### Branch Workflow (MANDATORY)
- **ALWAYS create a new branch** for each task implementation
- **NEVER commit directly to main** branch
- Branch naming: `feature/XX-description` (XX = PR number from roadmap)
- Follow the detailed roadmap in `plans/detailed-roadmap.md`

### Current Development Status
- ✅ Phase 1 completed: Project structure, models, basic setup
- ✅ ESLint setup completed: Code quality tools configured
- 🔄 Ready for Phase 2: Core functionality (TodoService, components)

### Testing Strategy
- **Unit Tests**: Use default Angular testing with Jasmine/Karma
- **Signal Testing**: Test signal interactions and computed values
- **Component Testing**: Mock services, test template bindings
- **Coverage Target**: 90%+

### Styling
- Uses **SCSS** for all styling (configured in angular.json)
- Component styles: `component-name.component.scss`
- Global styles: `src/styles.scss`
- SCSS variables: `src/styles/variables.scss`

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
Working on Phase 2 (Week 2) of the roadmap:
- PR #4: Todo Item Component
- PR #5: Add Todo Form Component  
- PR #6: Component Integration

Each PR should be 2-5 hours of focused development following the patterns established in Phase 1.
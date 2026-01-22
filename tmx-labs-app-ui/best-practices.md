# ADR-UI-001: Use pure pipes for data formatting in the template

## Status
Accepted

## Context
Need to provide consistent formatting in the template efficiently

## Decision
Use Angular pipes (pure pipes where possible) for data transformation and formatting

## Consequences
- ✅ Separation of formatting logic
- ❌ Instances where pure pipes can't be used can be non-performant

### ✅Do
```html
<span>{{person.birthDate | date}}</span>
```

### ❌Don't
```html
<span>{{formatBirthday(person.birthDate)}}</span>
```

# ADR-UI-002: Add reusable properties to Tailwind config

## Status
Accepted

## Context
Need consistent design tokens for colors, spacing, and other design properties across the application. 

## Decision
Define custom colors, spacing, and other design tokens in tailwind.config.js using the `extend` property to maintain base configuration while adding project-specific values. Allows us to leverage built in tailwind classes/standards with reusable custom values.

## Consequences
- ✅ Consistent design system across the application
- ✅ Easy to maintain and update design tokens globally
- ✅ Better developer experience with autocomplete

### ✅Do
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'brand-primary': '#1e40af',
      'brand-secondary': '#64748b',
      'status': {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      }
    },
    spacing: {
      'component-gap': '1.6rem',
      'section-padding': '3.2rem',
    }
  }
}
```

```html
<div class="p-component-gap bg-status-success">Content</div>
```

### ❌Don't
```html
<!-- Hard-coded values, single use, functionality obscured in scss -->
<div class="component-scoped-blue-500 p-4 mb-6">
<div style="background-color: #1e40af; padding: 16px;">
```
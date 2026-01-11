# AI Explanation UI Components

This document describes the AI explanation UI components implemented for the PC Build Assistant.

## Components Overview

### 1. AIExplanationPanel

**Purpose**: Displays AI-generated trade-off summaries and "Why Not This?" explanations.

**Requirements**: 3.1, 4.1

**Props**:
- `explanation: string` - Main AI-generated explanation text
- `mode: 'beginner' | 'advanced'` - UI mode for simplified or detailed display
- `whyNotExplanation?: string` - Optional "Why Not This?" explanation
- `onCloseWhyNot?: () => void` - Callback to close the "Why Not" panel

**Features**:
- Formats markdown-like text (bold, lists, headings)
- Shows trade-off summaries for component options
- Displays "Why Not This?" explanations in a highlighted panel
- Mode-aware display with hints for beginners

**Usage**:
```tsx
<AIExplanationPanel
  explanation={tradeOffSummary}
  mode="beginner"
  whyNotExplanation={whyNotText}
  onCloseWhyNot={() => setWhyNotText('')}
/>
```

### 2. ConversationalChat

**Purpose**: Interactive chat interface for asking the AI questions about the build.

**Requirements**: 7.1, 7.2

**Props**:
- `onQuery: (query: string) => string` - Callback that processes queries and returns responses
- `mode: 'beginner' | 'advanced'` - UI mode for simplified or detailed display

**Features**:
- Text input for user queries
- Conversation history with user and AI messages
- Typing indicator during processing
- Suggestion chips for common questions (beginner mode)
- Clear conversation history button
- Auto-scroll to latest messages
- Timestamp display for each message

**Usage**:
```tsx
<ConversationalChat
  onQuery={(query) => answerQuery(query, build, preferences)}
  mode="beginner"
/>
```

### 3. ComponentSelectorWithAI

**Purpose**: Enhanced ComponentSelector that integrates AI explanations with component selection.

**Requirements**: 2.2, 3.1, 3.2, 4.1, 7.1

**Props**:
- `componentType: ComponentType` - Type of component being selected
- `options: Component[]` - Array of compatible component options
- `onSelect: (component: Component) => void` - Callback when component is selected
- `mode: 'beginner' | 'advanced'` - UI mode

**Features**:
- Displays 2-3 component options with trade-off indicators
- Shows AI-generated trade-off summary
- Handles "Why Not This?" explanations for each component
- Includes conversational chat for build questions
- Integrates with compatibility engine and build store

**Usage**:
```tsx
<ComponentSelectorWithAI
  componentType="CPU"
  options={compatibleCPUs}
  onSelect={handleSelect}
  mode="beginner"
/>
```

## Integration with AI Explainer Service

All components integrate with the `aiExplainer` service:

### Trade-Off Summaries (Requirement 3.1)
```typescript
const summary = generateTradeOffSummary(options, context);
```

### "Why Not This?" Explanations (Requirement 4.1)
```typescript
const explanation = generateWhyNotExplanation(
  component,
  selectedComponent,
  context
);
```

### Conversational Queries (Requirement 7.1)
```typescript
const response = answerQuery(query, build, preferences);
```

## Styling

Each component has its own CSS file:
- `AIExplanationPanel.css` - Panel and modal styling
- `ConversationalChat.css` - Chat interface with message bubbles
- `ComponentSelector.css` - Grid layout and component cards (extended for AI version)

## Testing

Unit tests are provided for each component:
- `AIExplanationPanel.test.tsx` - Tests rendering and mode switching
- `ConversationalChat.test.tsx` - Tests message handling and conversation flow

## Mode-Aware Display

Both beginner and advanced modes are supported:

**Beginner Mode**:
- Simplified language
- Helpful hints and tooltips
- Suggestion chips for common questions
- Less technical detail

**Advanced Mode**:
- Technical terminology
- Detailed metrics and specifications
- No hints or suggestions
- Full technical information

## Accessibility

All components include:
- ARIA labels for screen readers
- Keyboard navigation support
- Semantic HTML structure
- Clear focus indicators

## Future Enhancements

Potential improvements:
- Real AI API integration (currently uses mock template-based generation)
- Voice input for conversational chat
- Export conversation history
- Persistent chat across sessions
- Multi-language support

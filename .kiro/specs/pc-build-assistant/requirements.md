# Requirements Document

## Introduction

The PC Build Assistant is an explainable, user-driven tool that guides users through building a custom PC by comparing compatible components step-by-step. The system uses AI to explain trade-offs and constraints while keeping users in control of all decisions. Unlike automated build generators, this tool prioritizes understanding over automation, ensuring users comprehend why each component choice matters.

## Glossary

- **System**: The PC Build Assistant application
- **User**: A person building a custom PC using the System
- **Component**: A PC hardware part (CPU, GPU, Motherboard, RAM, Storage, PSU)
- **Build**: A collection of selected Components forming a complete PC
- **Compatibility_Engine**: The subsystem that validates Component combinations
- **AI_Explainer**: The subsystem that generates natural language explanations
- **Build_Metrics**: Computed statistics about the current Build (strategy, bottlenecks, budget distribution)
- **Trade_Off**: A comparison showing what is gained and sacrificed between Component options
- **Beginner_Mode**: Simplified interface with guided language for novice users
- **Advanced_Mode**: Detailed interface with technical metrics for experienced users

## Requirements

### Requirement 1: Collect User Preferences

**User Story:** As a user, I want to specify my PC building requirements upfront, so that the system can filter and recommend appropriate components.

#### Acceptance Criteria

1. WHEN a user starts a new Build THEN the System SHALL prompt for budget range, primary use case, performance focus, storage requirements, and upgrade horizon
2. WHERE Beginner_Mode is selected, THE System SHALL present simplified input options with guided language
3. WHERE Advanced_Mode is selected, THE System SHALL present detailed controls including brand preferences and power constraints
4. WHEN a user provides preferences THEN the System SHALL validate that all required fields are completed before proceeding
5. WHEN preferences are saved THEN the System SHALL persist them for the duration of the Build session

### Requirement 2: Present Compatible Component Options

**User Story:** As a user, I want to see only compatible component options at each step, so that I never create an invalid PC build.

#### Acceptance Criteria

1. WHEN the System presents Component options THEN the Compatibility_Engine SHALL filter out all incompatible Components based on previously selected Components
2. WHEN displaying Component choices THEN the System SHALL present 2-3 viable options per Component category
3. THE System SHALL present Components in this order: CPU, GPU, Motherboard, RAM, Storage, PSU
4. WHEN no previously selected Components exist THEN the System SHALL present options based solely on user preferences
5. WHEN a Component is selected THEN the System SHALL update the compatibility constraints for subsequent Component selections

### Requirement 3: Explain Component Trade-Offs

**User Story:** As a user, I want to understand the trade-offs between component options, so that I can make informed decisions aligned with my priorities.

#### Acceptance Criteria

1. WHEN the System displays Component options THEN the AI_Explainer SHALL generate a summary of differences between the options
2. WHEN displaying each Component option THEN the System SHALL show trade-off indicators including cost, performance, power consumption, and upgrade path
3. WHEN a user views Component options THEN the AI_Explainer SHALL explain why each option exists and what the user gains or sacrifices by selecting it
4. THE AI_Explainer SHALL generate explanations that are constraint-aware and reference the user's stated preferences
5. WHERE Beginner_Mode is active, THE AI_Explainer SHALL use simplified language avoiding technical jargon

### Requirement 4: Provide "Why Not This" Explanations

**User Story:** As a user, I want to understand why certain components were deprioritized, so that I can validate the system's reasoning.

#### Acceptance Criteria

1. WHEN a user clicks "Why not this?" on any Component option THEN the AI_Explainer SHALL generate a constraint-aware explanation
2. WHEN generating "Why not this?" explanations THEN the AI_Explainer SHALL clearly state why the option was deprioritized relative to other options
3. THE AI_Explainer SHALL NOT override compatibility rules when explaining deprioritized options
4. WHEN explaining deprioritized options THEN the AI_Explainer SHALL reference specific user preferences or Build constraints that influenced the prioritization

### Requirement 5: Compute and Display Build Metrics

**User Story:** As a user, I want to see how my component choices affect the overall build strategy, so that I can ensure my build aligns with my goals.

#### Acceptance Criteria

1. WHEN Components are selected THEN the System SHALL compute Build_Metrics including build strategy tags, budget distribution, estimated bottleneck percentage, and upgrade flexibility indicators
2. WHEN Build_Metrics are updated THEN the System SHALL assign appropriate strategy tags: GPU-heavy, CPU-heavy, Balanced, or Power-efficient
3. WHERE Beginner_Mode is active, THE System SHALL display Build_Metrics using simplified visualizations and language
4. WHERE Advanced_Mode is active, THE System SHALL display detailed Build_Metrics with technical percentages and ratios
5. WHEN any Component selection changes THEN the System SHALL recalculate Build_Metrics immediately

### Requirement 6: Visualize PC Architecture

**User Story:** As a user, I want to see a visual representation of my PC build, so that I can understand how components relate to each other.

#### Acceptance Criteria

1. WHEN the System displays the Build THEN it SHALL show a visual representation of selected Components and their relationships
2. WHEN a Component is selected THEN the System SHALL update the visual representation dynamically
3. WHEN displaying Component relationships THEN the System SHALL indicate compatibility status visually
4. THE System SHALL highlight connections between interdependent Components (e.g., CPU to Motherboard, GPU to PSU)

### Requirement 7: Support Conversational AI Queries

**User Story:** As a user, I want to ask the AI questions about my build at any time, so that I can get clarification on decisions and trade-offs.

#### Acceptance Criteria

1. WHEN a user submits a conversational query THEN the AI_Explainer SHALL generate a response constrained by the current Build state, compatibility rules, and user preferences
2. THE System SHALL support queries about component relationships, upgrade paths, trade-offs, and build explanations
3. WHEN responding to queries THEN the AI_Explainer SHALL reference specific Components in the current Build when relevant
4. WHEN a user asks about compatibility THEN the AI_Explainer SHALL explain constraints based on the Compatibility_Engine rules
5. WHERE Beginner_Mode is active, THE AI_Explainer SHALL provide simplified explanations suitable for novice users

### Requirement 8: Generate Final Build Summary

**User Story:** As a user, I want to receive a comprehensive summary of my completed build, so that I understand the overall strategy and can make informed purchase decisions.

#### Acceptance Criteria

1. WHEN all required Components are selected THEN the System SHALL generate a final Build summary
2. WHEN generating the summary THEN the AI_Explainer SHALL provide a plain-language explanation of the Build including strengths, weaknesses, and intended use-case fit
3. WHEN displaying the summary THEN the System SHALL include upgrade recommendations prioritized by impact
4. WHEN the summary is generated THEN the System SHALL highlight key trade-offs made throughout the Build process
5. WHERE product API integration is available, THE System SHALL display purchase links for each Component
6. WHEN displaying the final summary THEN the System SHALL show a complete visual representation of the Build with all Components and their connections
7. WHEN the final visual is displayed THEN the System SHALL highlight the Build strategy visually (GPU-heavy, CPU-heavy, Balanced, Power-efficient)

### Requirement 9: Validate Component Compatibility

**User Story:** As a system architect, I want the compatibility engine to enforce strict validation rules, so that users never create invalid PC builds.

#### Acceptance Criteria

1. WHEN evaluating Component compatibility THEN the Compatibility_Engine SHALL validate CPU socket compatibility with Motherboard
2. WHEN evaluating Component compatibility THEN the Compatibility_Engine SHALL validate RAM type and speed compatibility with Motherboard
3. WHEN evaluating Component compatibility THEN the Compatibility_Engine SHALL validate PSU wattage sufficiency for all selected Components
4. WHEN evaluating Component compatibility THEN the Compatibility_Engine SHALL validate physical form factor compatibility (Motherboard size, case size, GPU length)
5. WHEN a compatibility violation is detected THEN the System SHALL prevent the invalid Component from being selectable

### Requirement 10: Persist Build State

**User Story:** As a user, I want my build progress to be saved, so that I can return to my build later without losing my selections.

#### Acceptance Criteria

1. WHEN a Component is selected THEN the System SHALL persist the Build state immediately
2. WHEN a user returns to an incomplete Build THEN the System SHALL restore all previously selected Components and user preferences
3. WHEN Build state is persisted THEN the System SHALL store Component selections, user preferences, and Build_Metrics
4. WHEN the System restarts THEN it SHALL restore the most recent Build state for the user

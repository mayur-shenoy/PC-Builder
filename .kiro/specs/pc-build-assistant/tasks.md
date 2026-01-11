# Implementation Plan: PC Build Assistant

## Overview

This implementation plan breaks down the PC Build Assistant into incremental coding tasks. Each task builds on previous work, starting with core data structures and compatibility logic, then adding state management, UI components, AI integration, and finally testing. The implementation uses TypeScript with React for the frontend, Zustand for state management, and fast-check for property-based testing.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Initialize React + TypeScript project with Vite
  - Install dependencies: zustand, fast-check, jest, react-testing-library
  - Configure TypeScript with strict mode
  - Set up test configuration for Jest and fast-check
  - _Requirements: All_

- [x] 2. Create core data models and types
  - [x] 2.1 Define TypeScript interfaces for all component types
    - Create ComponentType union type
    - Define Component base interface
    - Define specification interfaces: CPUSpecifications, GPUSpecifications, MotherboardSpecifications, RAMSpecifications, StorageSpecifications, PSUSpecifications
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [x] 2.2 Define build and preference types
    - Create UserPreferences interface
    - Create PartialBuild and CompleteBuild interfaces
    - Create BuildMetrics interface
    - Create CompatibilityConstraints interface
    - _Requirements: 1.1, 5.1, 10.3_
  
  - [x] 2.3 Write property test for data model completeness
    - **Property 24: Persisted Data Completeness**
    - **Validates: Requirements 10.3**

- [x] 3. Implement mock component data store
  - [x] 3.1 Create mock data for CPUs (5-10 components)
    - Include variety of sockets: LGA 1700, LGA 1200, AM4, AM5
    - Include range of prices and performance levels
    - _Requirements: 2.1, 9.1_
  
  - [x] 3.2 Create mock data for GPUs (5-10 components)
    - Include variety of power draws and performance levels
    - Include different VRAM capacities
    - _Requirements: 2.1, 9.3_
  
  - [x] 3.3 Create mock data for Motherboards (5-10 components)
    - Include variety of sockets matching CPUs
    - Include DDR4 and DDR5 support
    - Include different form factors: ATX, Micro-ATX, Mini-ITX
    - _Requirements: 2.1, 9.1, 9.2, 9.4_
  
  - [x] 3.4 Create mock data for RAM, Storage, and PSU
    - RAM: DDR4 and DDR5 modules with various speeds
    - Storage: M.2 NVMe, SATA SSD, SATA HDD options
    - PSU: Range of wattages from 500W to 1000W
    - _Requirements: 2.1, 9.2, 9.3_
  
  - [x] 3.5 Implement data store module with query functions
    - Create functions to get all components by type
    - Create function to get component by ID
    - Export all mock data
    - _Requirements: 2.1_

- [x] 4. Implement compatibility engine
  - [x] 4.1 Create compatibility validation functions
    - Implement validateCPUMotherboard (socket matching)
    - Implement validateRAMMotherboard (type and speed)
    - Implement validatePSUWattage (power sufficiency)
    - Implement validateFormFactors (physical compatibility)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [x] 4.2 Write property tests for compatibility rules
    - **Property 19: CPU-Motherboard Socket Compatibility**
    - **Validates: Requirements 9.1**
  
  - [x] 4.3 Write property tests for RAM compatibility
    - **Property 20: RAM-Motherboard Type Compatibility**
    - **Validates: Requirements 9.2**
  
  - [x] 4.4 Write property tests for PSU wattage
    - **Property 21: PSU Wattage Sufficiency**
    - **Validates: Requirements 9.3**
  
  - [x] 4.5 Write property tests for form factors
    - **Property 22: Form Factor Compatibility**
    - **Validates: Requirements 9.4**
  
  - [x] 4.6 Implement component filtering logic
    - Create filterCompatibleComponents function
    - Implement getCompatibilityConstraints function
    - Apply all validation rules to filter components
    - _Requirements: 2.1, 2.4, 2.5_
  
  - [x] 4.7 Write property test for compatibility filtering
    - **Property 3: Compatibility Filtering Correctness**
    - **Validates: Requirements 2.1, 9.5**
  
  - [x] 4.8 Write property test for constraint updates
    - **Property 6: Component Selection Updates Constraints**
    - **Validates: Requirements 2.5**

- [x] 5. Checkpoint - Ensure compatibility engine tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement build metrics computation
  - [x] 6.1 Create build strategy classification logic
    - Implement function to compute GPU-heavy, CPU-heavy, Balanced, Power-efficient tags
    - Base classification on component price ratios and specifications
    - _Requirements: 5.1, 5.2_
  
  - [x] 6.2 Implement budget distribution calculator
    - Calculate percentage of budget spent on each component type
    - _Requirements: 5.1_
  
  - [x] 6.3 Implement bottleneck estimation
    - Create simple heuristic for CPU/GPU bottleneck percentage
    - _Requirements: 5.1_
  
  - [x] 6.4 Implement upgrade flexibility scoring
    - Score based on motherboard features, PSU headroom, case compatibility
    - _Requirements: 5.1_
  
  - [x] 6.5 Create computeBuildMetrics function
    - Combine all metric calculations
    - Return complete BuildMetrics object
    - _Requirements: 5.1, 5.2_
  
  - [x] 6.6 Write property tests for build metrics
    - **Property 10: Build Metrics Completeness**
    - **Validates: Requirements 5.1**
  
  - [x] 6.7 Write property test for strategy tag validity
    - **Property 11: Build Strategy Tag Validity**
    - **Validates: Requirements 5.2**

- [x] 7. Implement state management with Zustand
  - [x] 7.1 Create build store with state and actions
    - Define BuildStore interface
    - Implement state: build, preferences, mode, currentStep
    - Implement actions: setPreferences, selectComponent, setMode, nextStep, previousStep, resetBuild
    - _Requirements: 1.5, 2.5, 5.5, 10.1_
  
  - [x] 7.2 Add local storage persistence middleware
    - Configure Zustand persist middleware
    - Store build state in localStorage
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [x] 7.3 Write property test for preference persistence
    - **Property 2: Preference Persistence Round Trip**
    - **Validates: Requirements 1.5**
  
  - [x] 7.4 Write property test for build state persistence
    - **Property 23: Build State Persistence Round Trip**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**
  
  - [x] 7.5 Integrate compatibility engine with store
    - Call filterCompatibleComponents when presenting options
    - Update constraints after component selection
    - _Requirements: 2.1, 2.5_
  
  - [x] 7.6 Integrate metrics computation with store
    - Recalculate metrics after each component selection
    - _Requirements: 5.5_
  
  - [x] 7.7 Write property test for metrics recalculation
    - **Property 12: Metrics Recalculation on Change**
    - **Validates: Requirements 5.5**

- [x] 8. Checkpoint - Ensure state management tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create AI explainer service (mock implementation)
  - [x] 9.1 Implement trade-off summary generator
    - Create function that compares components across cost, performance, power, upgradeability
    - Generate structured comparison text
    - Support beginner and advanced modes
    - _Requirements: 3.1, 3.2_
  
  - [x] 9.2 Implement "Why Not This?" explanation generator
    - Create function that explains why a component was deprioritized
    - Reference user preferences and compatibility constraints
    - _Requirements: 4.1_
  
  - [x] 9.3 Implement conversational query handler
    - Parse common query patterns (compatibility, upgrades, trade-offs)
    - Generate context-aware responses based on build state
    - _Requirements: 7.1, 7.2_
  
  - [x] 9.4 Implement final build summary generator
    - Generate plain-language explanation of build
    - Identify strengths and weaknesses
    - Provide upgrade recommendations
    - Highlight key trade-offs
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 9.5 Write property tests for explanation generation
    - **Property 7: Trade-Off Explanation Generation**
    - **Validates: Requirements 3.1**
  
  - [x] 9.6 Write property test for "Why Not" explanations
    - **Property 9: Why Not Explanation Generation**
    - **Validates: Requirements 4.1**
  
  - [x] 9.7 Write property test for query responses
    - **Property 15: Conversational Query Response Generation**
    - **Validates: Requirements 7.1**
  
  - [x] 9.8 Write property test for build summary
    - **Property 16: Complete Build Triggers Summary**
    - **Property 17: Build Summary Completeness**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [x] 10. Create preference collection UI
  - [x] 10.1 Create PreferenceForm component
    - Build form with all required fields: budget, use case, performance focus, storage, upgrade horizon
    - Implement form validation
    - _Requirements: 1.1, 1.4_
  
  - [x] 10.2 Implement beginner/advanced mode toggle
    - Show simplified inputs in beginner mode
    - Show additional fields (brand preferences, power constraints) in advanced mode
    - _Requirements: 1.2, 1.3_
  
  - [x] 10.3 Write property test for preference validation
    - **Property 1: Preference Validation Completeness**
    - **Validates: Requirements 1.4**
  
  - [x] 10.4 Connect PreferenceForm to build store
    - Call setPreferences action on form submission
    - Navigate to component selection after preferences saved
    - _Requirements: 1.5_

- [x] 11. Create component selection UI
  - [x] 11.1 Create ComponentSelector component
    - Display 2-3 component options with images/specs
    - Show trade-off indicators for each option
    - Handle component selection
    - _Requirements: 2.2, 3.2_
  
  - [x] 11.2 Write property test for option count
    - **Property 4: Component Option Count Constraint**
    - **Validates: Requirements 2.2**
  
  - [x] 11.3 Write property test for trade-off indicators
    - **Property 8: Trade-Off Indicators Presence**
    - **Validates: Requirements 3.2**
  
  - [x] 11.4 Create TradeOffDisplay component
    - Visualize cost, performance, power, upgradeability metrics
    - Support beginner (simplified) and advanced (detailed) modes
    - _Requirements: 3.2_
  
  - [x] 11.5 Create ComponentCard component
    - Display component name, image, key specs, price
    - Include "Why Not This?" button
    - _Requirements: 2.2, 4.1_
  
  - [x] 11.6 Integrate with compatibility engine
    - Fetch filtered components from store
    - Display only compatible options
    - _Requirements: 2.1_

- [x] 12. Create AI explanation UI
  - [x] 12.1 Create AIExplanationPanel component
    - Display AI-generated trade-off summaries
    - Show "Why Not This?" explanations in modal/panel
    - _Requirements: 3.1, 4.1_
  
  - [x] 12.2 Create ConversationalChat component
    - Text input for user queries
    - Display query responses
    - Maintain conversation history
    - _Requirements: 7.1, 7.2_
  
  - [x] 12.3 Connect AI components to explainer service
    - Call appropriate explainer functions based on user actions
    - Display generated explanations
    - _Requirements: 3.1, 4.1, 7.1_

- [x] 13. Create build metrics display UI
  - [x] 13.1 Create BuildMetricsDisplay component
    - Show build strategy tag prominently
    - Display budget distribution chart
    - Show bottleneck percentage
    - Show upgrade flexibility score
    - _Requirements: 5.1, 5.2_
  
  - [x] 13.2 Implement beginner/advanced mode views
    - Simplified visualizations for beginner mode
    - Detailed metrics for advanced mode
    - _Requirements: 5.3, 5.4_
  
  - [x] 13.3 Connect to build store
    - Subscribe to metrics updates
    - Re-render when metrics change
    - _Requirements: 5.5_

- [x] 14. Create PC architecture visualization
  - [x] 14.1 Create PCArchitectureVisual component
    - Use SVG or Canvas to draw component diagram
    - Show component boxes with labels
    - Draw connection lines between related components
    - _Requirements: 6.1, 6.2_
  
  - [x] 14.2 Implement compatibility status indicators
    - Highlight compatible connections in green
    - Show component relationships (CPU-Motherboard, GPU-PSU, etc.)
    - _Requirements: 6.3, 6.4_
  
  - [x] 14.3 Write property tests for visual rendering
    - **Property 13: Visual Representation Updates**
    - **Property 14: Compatibility Status Visualization**
    - **Validates: Requirements 6.1, 6.2, 6.3**
  
  - [x] 14.4 Connect to build store
    - Update visual when components are selected
    - Highlight current selection step
    - _Requirements: 6.2_

- [x] 15. Checkpoint - Ensure UI components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Create build wizard orchestrator
  - [x] 16.1 Create BuildWizard component
    - Manage step-by-step flow: CPU → GPU → Motherboard → RAM → Storage → PSU
    - Display current step indicator
    - Show back/next navigation
    - _Requirements: 2.3_
  
  - [x] 16.2 Integrate all child components
    - Render ComponentSelector for current step
    - Display AIExplanationPanel
    - Show BuildMetricsDisplay
    - Show PCArchitectureVisual
    - _Requirements: 2.1, 3.1, 5.1, 6.1_
  
  - [x] 16.3 Implement step navigation logic
    - Advance to next component type after selection
    - Allow going back to previous steps
    - Trigger final summary when all components selected
    - _Requirements: 2.3, 8.1_

- [x] 17. Create final build summary UI
  - [x] 17.1 Create BuildSummary component
    - Display AI-generated build explanation
    - Show strengths and weaknesses lists
    - Display use-case fit assessment
    - Show upgrade recommendations
    - Highlight key trade-offs
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [x] 17.2 Add final visual representation
    - Show complete PC architecture diagram
    - Highlight build strategy visually
    - Display all selected components
    - _Requirements: 8.6, 8.7_
  
  - [x] 17.3 Write property test for final visual
    - **Property 18: Final Visual Completeness**
    - **Validates: Requirements 8.6, 8.7**
  
  - [x] 17.4 Add purchase links (optional)
    - Display links to component product pages
    - Only show if product API integration available
    - _Requirements: 8.5_

- [x] 18. Implement error handling
  - [x] 18.1 Add error boundaries to React components
    - Wrap main app in error boundary
    - Display user-friendly error messages
    - _Requirements: All_
  
  - [x] 18.2 Handle compatibility engine errors
    - Display message when no compatible components exist
    - Allow user to backtrack and change selections
    - _Requirements: 2.1_
  
  - [x] 18.3 Handle AI explainer errors
    - Implement fallback explanations for API failures
    - Show loading states with timeouts
    - _Requirements: 3.1, 4.1, 7.1, 8.2_
  
  - [x] 18.4 Handle persistence errors
    - Warn user if localStorage is unavailable
    - Continue with in-memory state only
    - _Requirements: 10.1, 10.2_

- [x] 19. Add styling and polish
  - [x] 19.1 Apply consistent styling to all components
    - Use CSS modules or styled-components
    - Implement responsive design
    - _Requirements: All_
  
  - [x] 19.2 Add loading states and transitions
    - Show spinners during AI explanation generation
    - Add smooth transitions between steps
    - _Requirements: All_
  
  - [x] 19.3 Improve accessibility
    - Add ARIA labels
    - Ensure keyboard navigation works
    - Test with screen readers
    - _Requirements: All_

- [x] 20. Final checkpoint - Integration testing
  - [x] 20.1 Test complete build flow end-to-end
    - Start with preferences, select all components, view summary
    - Test both beginner and advanced modes
    - _Requirements: All_
  
  - [x] 20.2 Write integration tests for key user flows
    - Test preference collection → component selection → summary
    - Test backtracking and changing selections
    - Test persistence and restoration
    - _Requirements: All_
  
  - [x] 20.3 Verify all property tests pass with 100+ iterations
    - Run full test suite
    - Fix any failing tests
    - _Requirements: All_

- [x] 21. Final review and documentation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: data models → logic → state → UI
- Mock AI explainer uses template-based generation; can be replaced with real AI API later

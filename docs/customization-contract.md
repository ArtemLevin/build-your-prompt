# Prompt customization contract

This branch adds deep customization only to templates created after the six protected original generators.

## Invariants

- protected originals in `originals/` and their generated working pages are not modified;
- every added template exposes `detailed` and `battle` modes;
- detailed prompts are capped at 10,000 characters;
- battle prompts are capped at 5,000 characters;
- every select/radio/checkbox group has a deterministic default;
- common presets are supplemented by category-specific presets;
- custom user text remains part of the generated prompt unless the hard size limit requires compaction;
- compaction preserves the beginning and final constraints and marks that shortening occurred.
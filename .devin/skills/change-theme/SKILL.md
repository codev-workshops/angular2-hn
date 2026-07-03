---
name: change-theme
description: Change the secondary color and border color of the night theme
argument-hint: "<color>"
allowed-tools:
  - read
  - edit
  - grep
  - glob
triggers:
  - user
  - model
---

Change the night theme secondary color and border color in the project's styling to the specified color.

Input color: $ARGUMENTS

Please follow these steps to apply the color:
1. Locate the theme variables file `src/app/shared/scss/_theme_variables.scss`.
2. Read the file to locate `$theme-night-secondary-color` and `$theme-night-border`.
3. Use the `edit` tool to update the value of `$theme-night-secondary-color` to the specified input color `$ARGUMENTS`.
4. Use the `edit` tool to update the value of `$theme-night-border` to use the specified input color `$ARGUMENTS`. For example, if input color is `purple`, `$theme-night-border: 2px solid purple;`.
5. Verify the changes are correctly written by reading the file and checking that the new color has been successfully applied to the variables.

# AuthSheet Fix Instructions

The current AuthSheet has a structural issue where the email form doesn't expand inline properly.

## Problem
When clicking "استفاده از ایمیل" the form should expand inline below the button, but the current structure has nested forms and incorrect closing tags.

## Solution
The email form is now wrapped in `AnimatePresence` with `motion.div` and expands inline. The key changes needed:

1. The form starts at line 681 inside the AnimatePresence
2. Mode switching links should be INSIDE the form (at the bottom after submit button)
3. Reset and ResetPassword modes need their OWN separate forms OUTSIDE the signin/signup block
4. Proper indentation for all nested elements

## Structure should be:
```
- Google Button
- Error display (only when !showEmailForm)
- Divider
- "Use Email Instead" button (toggles showEmailForm)
- AnimatePresence
  - motion.div (when showEmailForm is true)
    - form onSubmit
      - name field (if signup)
      - email field
      - password field
      - confirm password (if signup)
      - error display
      - success display
      - submit button
      - mode switching links
- Mode switching links (when !showEmailForm)
```

The key fix is ensuring all the form fields and submit button are INSIDE the motion.div that animates height.

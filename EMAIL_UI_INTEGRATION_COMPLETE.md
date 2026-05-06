# Email Integration - UI Wiring Implementation Summary

This document summarizes all changes made to wire the 4 mailers to the UI flows.

---

## 1. Files Created

### Controllers
- **`app/controllers/password_controller.ts`** — Handles forgot password and password reset flows
  - `sendResetLink()` — Generates signed reset URL, sends ResetPasswordMailer
  - `showResetForm()` — Validates signed URL, shows password reset form
  - `resetPassword()` — Updates password after validation

### Pages (Inertia/React)
- **`inertia/pages/auth/reset_password.tsx`** — Password reset form page
  - Validates URL signature
  - Includes userId as hidden field
  - Shows password + confirm fields

---

## 2. Files Updated

### Controllers
- **`app/controllers/new_account_controller.ts`**
  - Updated `create()` — Determines step (1 or 2) from session, passes verifiedEmail prop
  - Added `verifyEmail()` — Step 1: verifies email, sends VerifyEmailMailer, stores email in session
  - Updated `store()` — Step 2: creates user, sends both VerifyEmailMailer and AccountPendingMailer

- **`app/controllers/admin_users_controller.ts`**
  - Updated `verify()` — After marking user as verified, sends AccountApprovedMailer

### Routes
- **`start/routes.ts`**
  - Added `POST /register/verify-email` → NewAccountController@verifyEmail
  - Added `GET /reset-password` → PasswordController@showResetForm
  - Added `POST /reset-password` → PasswordController@resetPassword
  - Added `POST /forgot-password` → PasswordController@sendResetLink

### UI Pages
- **`inertia/pages/auth/login.tsx`**
  - Added toggle state to show/hide forgot password form
  - Forgot password form with email input + "Envoyer le lien" button
  - Toggle button to return to login

- **`inertia/pages/auth/signup.tsx`**
  - Refactored into 2-step flow
  - **Step 1** — Email only with "Confirmer l'email" button
  - **Step 2** — Full registration with disabled (read-only) email field + hidden email input
  - Proper step indicators (Étape 1/2, Étape 2/2)

---

## 3. Email Flow Summary

| User Action | Route | Controller | Mailer Sent |
|---|---|---|---|
| Enter email at signup → click "Confirmer l'email" | POST /register/verify-email | NewAccountController@verifyEmail | VerifyEmailMailer |
| Complete registration → click "Créer mon compte" | POST /signup | NewAccountController@store | VerifyEmailMailer + AccountPendingMailer |
| Enter email on forgot password → click "Envoyer le lien" | POST /forgot-password | PasswordController@sendResetLink | ResetPasswordMailer |
| Admin clicks "Valider le compte" | POST /admin/users/:id/verify | AdminUsersController@verify | AccountApprovedMailer |

---

## 4. Key Design Details

### Forgot Password
- Uses AdonisJS signed URLs with 1-hour expiry
- `router.makeSignedUrl()` creates URL with `userId` in query params
- Signature validated on both GET and POST via `request.hasValidSignature()`
- Always returns same success message (no email enumeration)

### 2-Step Registration
- Step 1: Email verification only
- Email stored in session after verification (`session.put('verified_email', email)`)
- Step 2: Full form with email pre-filled but disabled visually
- Hidden `<input type="hidden" name="email">` submits the email value
- Session cleared after successful registration

### Admin Approval
- "Valider le compte" button calls existing route
- AccountApprovedMailer sent automatically when user marked as verified
- No changes to UI, only backend logic

---

## 5. Testing Checklist

- [ ] Login page shows "Mot de passe oublié?" button
- [ ] Clicking button reveals forgot password form
- [ ] Submitting email sends ResetPasswordMailer
- [ ] Reset link from email works and shows password form
- [ ] Resetting password redirects to login with success message
- [ ] Signup page shows Step 1 (email only)
- [ ] Confirming email sends VerifyEmailMailer
- [ ] Redirects to Step 2 with email pre-filled and disabled
- [ ] Completing registration shows success message
- [ ] New user receives VerifyEmailMailer + AccountPendingMailer
- [ ] Admin approval sends AccountApprovedMailer
- [ ] All text is in French
- [ ] All links in emails work correctly

---

## 6. Notes

- No new packages required (uses built-in AdonisJS & Resend)
- Signed URL expiry is 1 hour (configurable in controller)
- Email field in step 2 is visually disabled but value is submitted via hidden input
- All email sends are async (non-blocking)
- Security: forgot password never reveals if email exists
- Session is cleared after registration to prevent state leakage

---

## 7. Integration Points Already Configured

✓ VerifyEmailMailer → sent on Step 1 email confirm + Step 2 registration
✓ AccountPendingMailer → sent on Step 2 registration for non-admin users
✓ AccountApprovedMailer → sent when admin approves account
✓ ResetPasswordMailer → sent on forgot password request

All 4 mailers are now fully wired to their corresponding UI actions!

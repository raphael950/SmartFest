import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  fullName: vine.string().trim().maxLength(140).nullable(),
  pseudo: vine
    .string()
    .trim()
    .minLength(3)
    .maxLength(30)
    .alphaNumeric({ allowDashes: true, allowUnderscores: true })
    .unique({ table: 'users', column: 'pseudo' }),
  gender: vine.string().trim().minLength(2).maxLength(50),
  birthDate: vine.date(),
  jobTitle: vine.string().trim().minLength(2).maxLength(120),
  followedTeam: vine.string().trim().minLength(2).maxLength(120),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password().confirmed({
    confirmationField: 'passwordConfirmation',
  }),
})

/**
 * Validator to update current user public profile
 */
export const updateProfileValidator = vine.create({
  fullName: vine.string().trim().maxLength(140).nullable(),
  pseudo: vine
    .string()
    .trim()
    .minLength(3)
    .maxLength(30)
    .alphaNumeric({ allowDashes: true, allowUnderscores: true }),
  gender: vine.string().trim().minLength(2).maxLength(50),
  birthDate: vine.date(),
  jobTitle: vine.string().trim().minLength(2).maxLength(120),
  followedTeam: vine.string().trim().minLength(2).maxLength(120),
})

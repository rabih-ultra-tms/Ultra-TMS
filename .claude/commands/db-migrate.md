Guided Prisma database schema change workflow. Description of change: $ARGUMENTS

## Instructions

### Step 1: Understand the Change

1. **Parse arguments** for what database change is needed. If not clear, ask the user:
   - Adding a new model?  (recommend `/scaffold-prisma` instead)
   - Adding fields to an existing model?
   - Modifying field types?
   - Adding relations between models?
   - Adding/modifying indexes?
   - Adding enums?

2. **Read the current schema** at `apps/api/prisma/schema.prisma` and find the relevant model(s).

3. **Show the current state** of the model(s) to the user.

### Step 2: Plan the Change

4. **Draft the schema changes** and show them to the user:
   - For new fields: show field definition with type, decorators, and map
   - For relations: show both sides of the relation
   - For indexes: show the `@@index()` definition
   - For enums: show the full enum block

5. **Check for breaking changes**:
   - Is a required field being added to a table with existing data? (needs default value)
   - Is a field type changing? (may need data migration)
   - Is a relation being modified? (check cascade behavior)

6. **Ask for user confirmation** before proceeding.

### Step 3: Apply Changes

7. **Edit the schema** at `apps/api/prisma/schema.prisma` with the approved changes.

8. **Run the Prisma workflow** in sequence:

   a. **Format**: `pnpm --filter api exec prisma format`
      - Fixes indentation and formatting
      - If errors, show them and fix

   b. **Validate**: `pnpm --filter api exec prisma validate`
      - Checks schema is valid
      - If errors, show them and fix before continuing

   c. **Migrate**: `pnpm --filter api exec prisma migrate dev --name {description_snake_case}`
      - Creates and applies the migration
      - Migration name should describe the change (e.g., `add_invoice_status_field`)
      - If migration fails, show the error

   d. **Generate**: `pnpm --filter api exec prisma generate`
      - Regenerates the Prisma client with new types
      - This updates TypeScript types used in service files

### Step 4: Verify

9. **Run TypeScript check**: `pnpm --filter api exec tsc --noEmit`
   - If type errors appear (e.g., services using old field names), help fix them

10. **Show summary**:
    ```
    ## Database Migration Complete

    ### Change: [description]
    - Model(s) modified: [list]
    - Fields added/modified: [list]
    - Migration name: [name]
    - Migration file: prisma/migrations/[timestamp]_[name]/

    ### Next Steps
    - Update DTOs to match new fields
    - Update service queries if field names changed
    - Update seed script if sample data needed
    - Run tests: `pnpm --filter api test`
    ```

### Important Notes

- NEVER modify or delete existing migration files
- ALWAYS use `prisma migrate dev` for local development (not `db push`)
- For production, use `prisma migrate deploy`
- If the migration creates a new required column on an existing table, add a `@default()` value
- Migration names should be short, descriptive, snake_case (e.g., `add_status_to_invoice`)

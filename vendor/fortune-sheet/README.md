# Vendored FortuneSheet packages

The `core` and `react` directories contain locally built FortuneSheet packages.
They are committed so builds do not depend on a sibling source checkout.

To refresh them after modifying `../fortune-sheet`:

1. Build FortuneSheet from its repository with `yarn build`.
2. Run `npm run vendor:fortune-sheet` from the `frontend` directory.
3. Run `npm install` if either vendored package manifest changed.

Application imports continue to use `@fortune-sheet/core` and
`@fortune-sheet/react`.

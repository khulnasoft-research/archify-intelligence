# Archify upstream runtime placeholder

Do not place an unpinned clone of Archify here.

P0 action:
1. Review `https://github.com/tt-a1i/archify` at the intended release.
2. Record the full 40-character commit SHA and release/tag in the dependency inventory.
3. Verify license and NOTICE requirements for the exact vendored files.
4. Add a pinned git submodule or reproducible source checkout.
5. Copy/record the exact supported schemas and fixtures for the pinned version.
6. Set `ARCHIFY_EXPECTED_COMMIT` to the verified SHA.

The adapter intentionally refuses to initialize with an unpinned value.

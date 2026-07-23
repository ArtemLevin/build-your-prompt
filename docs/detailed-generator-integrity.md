# Detailed generator preservation contract

The six original prompt generators are protected as immutable source snapshots under `originals/`.

Working HTML pages are rebuilt by `scripts/restore-detailed-generators.mjs`. The transformation may only:

1. remove the external font import;
2. connect the shared watercolor CSS and compatibility JavaScript;
3. add a `data-detailed-original` marker;
4. correct the three confirmed JavaScript syntax defects.

It must not shorten, rewrite, reorder or replace prompt text, form fields, selectable values or generation rules.

`node scripts/validate-pages.mjs` verifies the Git blob SHA of every archived source before validating working pages.
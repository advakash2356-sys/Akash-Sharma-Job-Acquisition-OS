import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasTerm, daysOld } from '../src/lib/keywords';
import { keywordGap } from '../src/lib/insights';
test('tense and plural variants match', () => { assert.ok(hasTerm('Managed a team', 'management')); assert.ok(hasTerm('negotiating contracts', 'contract')); });
test('synonyms match', () => { assert.ok(hasTerm('Built apps in JavaScript', 'js')); assert.ok(hasTerm('client relations', 'customer')); assert.ok(!hasTerm('cooking', 'kubernetes')); });
test('keywordGap uses smart matching', () => { assert.ok(keywordGap('Managed contracts', 'management of contracts management').hit.includes('management')); });
test('daysOld', () => { assert.equal(daysOld('2026-01-01', Date.parse('2026-02-10')), 40); assert.equal(daysOld(''), -1); });

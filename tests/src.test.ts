import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isCampaignTag } from '../src/lib/keywords';
test('?src= campaign tags', () => { assert.ok(isCampaignTag('reddit-3')); assert.ok(isCampaignTag('reel-11')); assert.ok(!isCampaignTag('<x>')); assert.ok(!isCampaignTag('reddit')); });

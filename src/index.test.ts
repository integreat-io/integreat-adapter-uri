import test from 'node:test'
import assert from 'node:assert/strict'

import adapter from './index.js'

// Setup

const options = {}

// Tests -- prepareOptions

test('should prepare empty options', () => {
  const options = {}
  const expected = {}

  const ret = adapter.prepareOptions(options, 'api')

  assert.deepEqual(ret, expected)
})

test('should remove all unknown options', () => {
  const options = { dontKnow: 'whatisthis' }
  const expected = {}

  const ret = adapter.prepareOptions(options, 'api')

  assert.deepEqual(ret, expected)
})

// Tests -- normalize

test('should not touch action on normalization', async () => {
  const action = {
    type: 'GET',
    payload: { type: 'entry' },
    response: { status: 'ok', data: '[{"id":"ent1","title":"Entry 1"}]' },
    meta: {
      ident: { id: 'johnf' },
      options: { uri: 'https://entries.test/{id}' },
    },
  }
  const expected = action

  const ret = await adapter.normalize(action, options)

  assert.deepEqual(ret, expected)
})

// Tests -- serialize

test('should replace placeholders in uri template', async () => {
  const action = {
    type: 'GET',
    payload: { type: 'entry', id: 'ent1', archived: true, cacheAge: 3600 },
    meta: {
      ident: { id: 'johnf' },
      options: {
        uri: 'http://json1.test/entries/{payload.id}?archived={payload.archived}&refresh={payload.cacheAge}',
      },
    },
  }
  const expected = {
    type: 'GET',
    payload: { type: 'entry', id: 'ent1', archived: true, cacheAge: 3600 },
    meta: {
      ident: { id: 'johnf' },
      options: {
        uri: 'http://json1.test/entries/ent1?archived=true&refresh=3600',
      },
    },
  }

  const ret = await adapter.serialize(action, options)

  assert.deepEqual(ret, expected)
})

test('should not touch action without uri template on serialization', async () => {
  const action = {
    type: 'GET',
    payload: { type: 'entry', sourceService: 'api' },
    response: { status: 'ok', data: [{ id: 'ent1', title: 'Entry 1' }] },
    meta: { ident: { id: 'johnf' }, options: {} },
  }
  const expected = action

  const ret = await adapter.serialize(action, options)

  assert.deepEqual(ret, expected)
})

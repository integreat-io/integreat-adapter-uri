import test from 'ava'

import generateUri from './transformer.js'

// Setup

const options = {}
const state = {
  rev: false,
  onlyMappedValues: false,
  context: [],
  value: {},
}

// Tests

test('should replace placeholder in template', async (t) => {
  const template = 'http://json1.test/entries/{payload.id}'
  const action = { type: 'GET', payload: { type: 'entry', id: 'ent1' } }
  const expected = 'http://json1.test/entries/ent1'

  const ret = await generateUri({ template })(options)(action, state)

  t.is(ret, expected)
})

test('should get template from templatePath', async (t) => {
  const templatePath = 'meta.options.uri'
  const action = {
    type: 'GET',
    payload: { type: 'entry', id: 'ent1' },
    meta: { options: { uri: 'http://json1.test/entries/{payload.id}' } },
  }
  const expected = 'http://json1.test/entries/ent1'

  const ret = await generateUri({ templatePath })(options)(action, state)

  t.is(ret, expected)
})

test('should replace several placeholders in template and force to string', async (t) => {
  const template =
    'http://json1.test/entries/{payload.id}?archived={payload.archived}&refresh={payload.cacheAge}'
  const action = {
    type: 'GET',
    payload: { type: 'entry', id: 'ent1', archived: true, cacheAge: 3600 },
  }
  const expected = 'http://json1.test/entries/ent1?archived=true&refresh=3600'

  const ret = await generateUri({ template })(options)(action, state)

  t.is(ret, expected)
})

test('should uri encode values', async (t) => {
  const template =
    '/production?query={payload.query}&%24table=%22{payload.id}%22'
  const action = {
    type: 'GET',
    payload: {
      type: 'table',
      query: "*[_type=='table'&&key==$table][0].fields{key,name,type}",
      id: 'orders',
    },
  }
  const expected =
    "/production?query=*%5B_type%3D%3D'table'%26%26key%3D%3D%24table%5D%5B0%5D.fields%7Bkey%2Cname%2Ctype%7D&%24table=%22orders%22"

  const ret = await generateUri({ template })(options)(action, state)

  t.is(ret, expected)
})

test('should convert date to ISO string', async (t) => {
  const template = 'http://json1.test/entries?since={payload.updatedAfter}'
  const action = {
    type: 'GET',
    payload: { type: 'entry', updatedAfter: new Date('2023-03-08T00:00:00Z') },
  }
  const expected =
    'http://json1.test/entries?since=2023-03-08T00%3A00%3A00.000Z'

  const ret = await generateUri({ template })(options)(action, state)

  t.is(ret, expected)
})

test('should convert array to comma separated string', async (t) => {
  const template = 'http://json1.test/entries?ids={payload.id}'
  const action = {
    type: 'GET',
    payload: { type: 'entry', id: ['ent1', 'ent2'] },
  }
  const expected = 'http://json1.test/entries?ids=ent1,ent2'

  const ret = await generateUri({ template })(options)(action, state)

  t.is(ret, expected)
})

test('should not uri encode values when placeholder starts with plus', async (t) => {
  const template = 'http://awsome.api/v1/{+payload.method}'
  const action = {
    type: 'SET',
    payload: {
      type: 'job',
      method: 'entries:expire',
    },
  }
  const expected = 'http://awsome.api/v1/entries:expire'

  const ret = await generateUri({ template })(options)(action, state)

  t.is(ret, expected)
})

test('should handle uris with a lot of strange chars', async (t) => {
  const template =
    '/data/query/production?query={payload.query}&$table={payload.table}'
  const action = {
    type: 'SET',
    payload: {
      type: 'job',
      query:
        "*[_type=='table'&&key==$table][0].fields{key,name,type,hidden,variant,currencyField,dateField,aggregation,size}",
      table: '"orders"',
    },
  }
  const expected =
    "/data/query/production?query=*%5B_type%3D%3D'table'%26%26key%3D%3D%24table%5D%5B0%5D.fields%7Bkey%2Cname%2Ctype%2Chidden%2Cvariant%2CcurrencyField%2CdateField%2Caggregation%2Csize%7D&$table=%22orders%22"

  const ret = await generateUri({ template })(options)(action, state)

  t.is(ret, expected)
})

test('should allow double and triple brackets for compability', async (t) => {
  const template =
    'http://json1.test/entries/{{{payload.id}}}?since={{payload.updatedAfter}}'
  const action = {
    type: 'GET',
    payload: {
      type: 'entry',
      id: 'entry:ent1',
      updatedAfter: new Date('2023-03-08T00:00:00Z'),
    },
  }
  const expected =
    'http://json1.test/entries/entry:ent1?since=2023-03-08T00%3A00%3A00.000Z'

  const ret = await generateUri({ template })(options)(action, state)

  t.is(ret, expected)
})

test('should return template without placeholders', async (t) => {
  const template = 'http://json1.test/entries'
  const action = { type: 'GET', payload: { type: 'entry', id: 'ent1' } }
  const expected = 'http://json1.test/entries'

  const ret = await generateUri({ template })(options)(action, state)

  t.is(ret, expected)
})

test('should remove placeholder when path does not match a value', async (t) => {
  const template =
    'http://json1.test/entries/{payload.id}?archived={payload.archived}'
  const action = {
    type: 'GET',
    payload: { type: 'entry', id: 'ent1' }, // No archived prop
  }
  const expected = 'http://json1.test/entries/ent1?archived='

  const ret = await generateUri({ template })(options)(action, state)

  t.is(ret, expected)
})

test('should return undefined when no template', async (t) => {
  const template = undefined
  const action = { type: 'GET', payload: { type: 'entry', id: 'ent1' } }
  const expected = undefined

  const ret = await generateUri({ template })(options)(action, state)

  t.is(ret, expected)
})

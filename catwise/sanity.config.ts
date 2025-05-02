import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Catwise',

  projectId: '9t5dg82i',
  dataset: 'recursos',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})

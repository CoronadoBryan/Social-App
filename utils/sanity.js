import { createClient } from '@sanity/client'

console.log('Sanity config:', {
  projectId: '9t5dg82i',
  dataset: 'recursos',
  useCdn: true,
  apiVersion: '2023-01-01'
})

export default createClient({
  projectId: '9t5dg82i',
  dataset: 'recursos',
  useCdn: true,
  apiVersion: '2023-01-01'
})
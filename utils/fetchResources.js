import { createClient } from '@sanity/client'

const sanity = createClient({
  projectId: '9t5dg82i',
  dataset: 'recursos',
  useCdn: true,
  apiVersion: '2023-01-01',
  token: 'skeBgWMj3E8RspO9zFkSHl8qlE8IHclf9Hw8NdGKPGjKLlLJA3xWwsYa1ZuaNo8JEyKMeLfeAD8ips1JAnZi0KEADlD8zD50R8Hnp5lXAuf1p4BbFcnCK0DpnVGL4o3Bgz3tKGQQ5ZVvM6NMfwXuGAD2YRhiQuejzQoSF0jznhoHlYFK9Tue'
})

export const fetchResources = async () => {
  const query = `*[_type == "resource"]{
    _id,
    title,
    description,
    tags,
    coverImageUrl,
    "fileUrl": file.asset->url,
    tipo,
    attributes,      // <--- agrega esta línea
    _createdAt
  }`
  return await sanity.fetch(query)
}
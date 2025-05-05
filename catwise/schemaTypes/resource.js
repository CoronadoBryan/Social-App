export default {
  name: 'resource',
  type: 'document',
  title: 'Recurso',
  fields: [
    { name: 'title', type: 'string', title: 'Título' },
    { name: 'description', type: 'text', title: 'Descripción' },
    { name: 'tags', type: 'array', of: [{ type: 'string' }], title: 'Etiquetas' },
    { name: 'coverImageUrl', type: 'url', title: 'URL de imagen de portada' },
    { name: 'file', type: 'file', title: 'Archivo para descargar' },
    { name: 'tipo', type: 'string', title: 'Tipo' },
    {
      name: 'attributes',
      type: 'array',
      title: 'Atributos técnicos',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'key', type: 'string', title: 'Clave' },
            { name: 'value', type: 'string', title: 'Valor' }
          ]
        }
      ]
    }
  ]
}
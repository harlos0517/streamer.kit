const TOKEN_PATTERN = /\{\{\s*([\w.]+)\s*\}\}/g

const resolvePath = (data: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value !== null && typeof value === 'object' && key in value)
      return (value as Record<string, unknown>)[key]

    return undefined
  }, data)
}

// {{path.to.value}} substitution only - no JS evaluation, by construction.
export const renderTemplate = (template: string, data: Record<string, unknown>): string => {
  return template.replace(TOKEN_PATTERN, (_match, path: string) => {
    const value = resolvePath(data, path)
    return value === undefined || value === null ? '' : String(value)
  })
}

export const createTemplateService = () => {
  return { render: renderTemplate }
}

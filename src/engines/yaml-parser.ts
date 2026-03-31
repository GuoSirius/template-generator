import yaml from 'js-yaml'
import type {
  PagesRegistry,
  TemplateConfig,
  SnippetsRegistry,
  SnippetConfig,
  TemplateMeta,
  SnippetMeta,
} from '@/types'

const cache = new Map<string, any>()

export async function loadYaml<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url) as T
  }
  const base = import.meta.env.BASE_URL || './'
  const fullUrl = url.startsWith('http') ? url : `${base}${url}`
  const response = await fetch(fullUrl)
  if (!response.ok) {
    throw new Error(`Failed to load YAML: ${url} (${response.status})`)
  }
  const text = await response.text()
  const parsed = yaml.load(text) as T
  cache.set(url, parsed)
  return parsed
}

export async function loadHtml(url: string): Promise<string> {
  const base = import.meta.env.BASE_URL || './'
  const fullUrl = url.startsWith('http') ? url : `${base}${url}`
  const response = await fetch(fullUrl)
  if (!response.ok) {
    throw new Error(`Failed to load HTML: ${url} (${response.status})`)
  }
  return response.text()
}

export async function getPagesRegistry(): Promise<PagesRegistry> {
  return loadYaml<PagesRegistry>('template/pages/pages.yaml')
}

export async function getSnippetsRegistry(): Promise<SnippetsRegistry> {
  return loadYaml<SnippetsRegistry>('template/snippets/snippets.yaml')
}

export async function getTemplateConfig(folder: string): Promise<TemplateConfig> {
  return loadYaml<TemplateConfig>(`template/pages/${folder}/${folder}.yaml`)
}

export async function getTemplateHtml(folder: string): Promise<string> {
  return loadHtml(`template/pages/${folder}/${folder}.html`)
}

export async function getSnippetConfig(folder: string): Promise<SnippetConfig> {
  return loadYaml<SnippetConfig>(`template/snippets/${folder}/${folder}.yaml`)
}

export async function getSnippetHtml(folder: string): Promise<string> {
  return loadHtml(`template/snippets/${folder}/${folder}.html`)
}

export function clearCache(): void {
  cache.clear()
}

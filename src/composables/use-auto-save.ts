import { watch, onUnmounted } from 'vue'
import { saveProject } from '@/database'
import type { Project } from '@/types'

export function useAutoSave(getProject: () => Project | undefined, delay: number = 500) {
  let timer: ReturnType<typeof setTimeout> | null = null

  const save = async () => {
    const project = getProject()
    if (project) {
      await saveProject({ ...project, updatedAt: Date.now() })
    }
  }

  const debouncedSave = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(save, delay)
  }

  watch(
    getProject,
    () => {
      debouncedSave()
    },
    { deep: true },
  )

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
    save()
  })

  return {
    save,
    debouncedSave,
  }
}

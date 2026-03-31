const CSS_CLASS_REGEX = /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/

export function useClassValidator() {
  const validateClassName = (name: string): { valid: boolean; error: string } => {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: '类名不能为空' }
    }

    const parts = name.trim().split(/\s+/)
    for (const part of parts) {
      if (!CSS_CLASS_REGEX.test(part)) {
        return {
          valid: false,
          error: `类名 "${part}" 不合法，只能包含字母、数字、连字符和下划线，且不能以数字开头`,
        }
      }
    }

    return { valid: true, error: '' }
  }

  const sanitizeClassName = (name: string): string => {
    return name
      .trim()
      .replace(/[^_a-zA-Z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return {
    validateClassName,
    sanitizeClassName,
  }
}

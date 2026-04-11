/**
 * @Description 判断是否合法的的URL
 * @Author holyer
 * @param { string } url - 要验证的URL
 * @return { boolean } - 如果URL合法返回true，否则返回false
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

/**
 * @Description 生成UUID字符串
 * @Author holyer
 * @return { string } - 返回生成的UUID
 */
export const uuid = (): string => {
  if (crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

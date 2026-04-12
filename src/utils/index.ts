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

/**
 * @Description 比较两个版本号的大小。
 * @Author holyer
 * @param { String } v1 - 第一个版本号字符串，格式为 "主版本号.次版本号.修订号"，例如 "1.2.3"。
 * @param { String } v2 - 第二个版本号字符串，格式同 v1。
 * @return { Number }  如果 v1 大于 v2，返回 1；如果 v1 小于 v2，返回 -1；如果相等，返回 0。
 */
export const compareVersions = (v1: string, v2: string) => {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0
    const num2 = parts2[i] || 0
    // v1 > v2
    if (num1 > num2) return 1
    // v1 < v2
    if (num1 < num2) return -1
  }

  // 相等
  return 0
}

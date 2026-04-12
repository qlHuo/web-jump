import { isValidURL } from '@/utils'
import type { Version } from '@/db/models'
import { MessagePlugin } from 'tdesign-vue-next'

const BASE_URL = 'https://website-manager-api.qlhuo.workers.dev'

export function useWorkerApi() {
  // 根据URL获取网站元信息
  async function getMetaInfoByUrl(url: string): Promise<object> {
    if (!url.trim() || !isValidURL(url)) {
      return MessagePlugin.error('URL 格式不正确')
    }
    const response = await fetch(`${BASE_URL}/api/get-meta-by-url?url=${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error (${response.status}): ${errorText}`)
    }

    return response.json()
  }

  /**
   * @Description 推送网站数据到Github
   * @Author holyer
   * @Date 2026/04/12 16:32:14
   * @param { String } auth 约定的管理员权限密钥
   * @param { Object } { directory: [], categories: [], websites: [], versions: [] }
   * @return { Boolean } 是否推送成功
   */
  async function pushWebsiteDataToGithub(auth: string, data: object): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BASE_URL}/api/push-websites-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error (${response.status}): ${errorText}`)
      }

      const result = await response.json()
      // 确保 API 响应格式符合期望
      return result as { success: boolean; message: string }
    } catch (error) {
      // 统一错误处理，返回期望的格式
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return {
        success: false,
        message: errorMessage,
      }
    }
  }

  /**
   * @Description 获取远程数据
   * @Author holyer
   * @Date 2026/04/12 16:32:14
   * @return { Array } 远程网站数据
   */
  async function getRemoteWebsiteData(): Promise<Array<object>> {
    const response = await fetch(`${BASE_URL}/api/get-websites-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error (${response.status}): ${errorText}`)
    }
    return response.json()
  }

  /**
   * @Description 获取远程最新版本
   * @Author holyer
   * @Date 2026/04/12 16:32:14
   * @return { Object } 最新版本数据
   */
  async function getRemoteLatestVersion(): Promise<object> {
    const response = await fetch(`${BASE_URL}/api/get-latest-version`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error (${response.status}): ${errorText}`)
    }
    return response.json()
  }

  /**
   * @Description 获取远程全部版本
   * @Author holyer
   * @Date 2026/04/12 16:32:14
   * @return { Array } 最新版本数据
   */
  async function getRemoteAllVersions(): Promise<{ success: boolean; data: Version[]; message?: string }> {
    const response = await fetch(`${BASE_URL}/api/get-all-versions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error (${response.status}): ${errorText}`)
    }
    return response.json()
  }

  return {
    getMetaInfoByUrl,
    pushWebsiteDataToGithub,
    getRemoteWebsiteData,
    getRemoteLatestVersion,
    getRemoteAllVersions,
  }
}

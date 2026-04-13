// src/services/github.ts
import { Env, GITHUB_API_BASE, FILE_PATHS } from '../config'

/**
 * GitHub API 请求封装
 * @param path - API 路径
 * @param method - HTTP 方法
 * @param body - 请求体
 * @param env - 环境变量
 * @returns Response 对象
 */
export async function githubRequest(path: string, method: string, body: unknown = null, env: Env): Promise<Response> {
  const headers: Record<string, string> = {
    Authorization: `token ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'WebsiteManager/1.0',
  }

  if (body) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  return response
}

/**
 * 获取文件内容
 * @param filePath - 文件路径
 * @param env - 环境变量
 * @returns 文件内容字符串或 null
 */
export async function getFileContent(filePath: string, env: Env): Promise<string | null> {
  const branch = env.BRANCH_NAME || 'main'
  try {
    const response = await githubRequest(
      `/repos/${env.REPO_OWNER}/${env.REPO_NAME}/contents/${filePath}?ref=${branch}`,
      'GET',
      null,
      env
    )

    if (response.ok) {
      const data = await response.json()
      // 1. 移除空白字符
      const cleanBase64 = data.content.replace(/\s/g, '')
      // 2. base64 → Uint8Array (原始字节)
      const binString = atob(cleanBase64)
      const bytes = Uint8Array.from(binString, m => m.charCodeAt(0))
      // 3. 按 UTF-8 解码
      return new TextDecoder('utf-8').decode(bytes)
    }
    return null
  } catch (error) {
    console.error(`Error getting file ${filePath}:`, error)
    return null
  }
}

/**
 * 批量更新多个文件（使用低级 Git API）
 * @param files - 要更新的文件数组
 * @param message - 提交信息
 * @param env - 环境变量
 * @returns 更新是否成功
 */
export async function updateMultipleFiles(
  files: Array<{ path: string; content: string }>,
  message: string,
  env: Env
): Promise<boolean> {
  const branch = env.BRANCH_NAME || 'main'

  try {
    // 1. 获取当前分支的最新提交
    const refResponse = await githubRequest(
      `/repos/${env.REPO_OWNER}/${env.REPO_NAME}/git/ref/heads/${branch}`,
      'GET',
      null,
      env
    )

    if (!refResponse.ok) {
      console.error('Failed to get branch ref:', await refResponse.text())
      return false
    }

    const refData = await refResponse.json()
    const latestCommitSha = refData.object.sha

    // 2. 获取最新提交的树
    const commitResponse = await githubRequest(
      `/repos/${env.REPO_OWNER}/${env.REPO_NAME}/git/commits/${latestCommitSha}`,
      'GET',
      null,
      env
    )

    if (!commitResponse.ok) {
      console.error('Failed to get commit:', await commitResponse.text())
      return false
    }

    const commitData = await commitResponse.json()
    const baseTreeSha = commitData.tree.sha

    // 3. 创建新的 blob 对象
    const newBlobs = []
    for (const file of files) {
      const blobResponse = await githubRequest(
        `/repos/${env.REPO_OWNER}/${env.REPO_NAME}/git/blobs`,
        'POST',
        {
          content: file.content,
          encoding: 'utf-8',
        },
        env
      )

      if (!blobResponse.ok) {
        console.error('Failed to create blob:', await blobResponse.text())
        return false
      }

      const blobData = await blobResponse.json()
      newBlobs.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      })
    }

    // 4. 创建新的树
    const treeResponse = await githubRequest(
      `/repos/${env.REPO_OWNER}/${env.REPO_NAME}/git/trees`,
      'POST',
      {
        base_tree: baseTreeSha,
        tree: newBlobs,
      },
      env
    )

    if (!treeResponse.ok) {
      console.error('Failed to create tree:', await treeResponse.text())
      return false
    }

    const treeData = await treeResponse.json()

    // 5. 创建新的提交
    const commitCreateResponse = await githubRequest(
      `/repos/${env.REPO_OWNER}/${env.REPO_NAME}/git/commits`,
      'POST',
      {
        message,
        tree: treeData.sha,
        parents: [latestCommitSha],
      },
      env
    )

    if (!commitCreateResponse.ok) {
      console.error('Failed to create commit:', await commitCreateResponse.text())
      return false
    }

    const newCommitData = await commitCreateResponse.json()

    // 6. 更新引用
    const updateRefResponse = await githubRequest(
      `/repos/${env.REPO_OWNER}/${env.REPO_NAME}/git/refs/heads/${branch}`,
      'PATCH',
      {
        sha: newCommitData.sha,
      },
      env
    )

    if (!updateRefResponse.ok) {
      console.error('Failed to update ref:', await updateRefResponse.text())
    }

    return updateRefResponse.ok
  } catch (error) {
    console.error('Error updating multiple files:', error)
    return false
  }
}

/**
 * 获取完整的数据集
 * @param env - 环境变量
 * @returns 包含 directory、categories、websites 的对象
 */
export async function getFullDataset(env: Env) {
  // 并行获取所有文件以提高性能
  const [directoryContent, categoriesContent, websitesContent, versionsContent] = await Promise.all([
    getFileContent(FILE_PATHS.DIRECTORY, env),
    getFileContent(FILE_PATHS.CATEGORIES, env),
    getFileContent(FILE_PATHS.WEBSITES, env),
    getFileContent(FILE_PATHS.VERSIONS, env),
  ])

  // 解析 JSON 内容，如果文件不存在则返回空数组/默认值
  const directory = directoryContent ? JSON.parse(directoryContent) : []
  const categories = categoriesContent ? JSON.parse(categoriesContent) : []
  const websites = websitesContent ? JSON.parse(websitesContent) : []
  const versions = versionsContent ? JSON.parse(versionsContent) : []

  // // 更新目录信息
  // directory.lastUpdated = new Date().toISOString()
  // directory.totalWebsites = websites.length

  return {
    directory,
    categories,
    websites,
    versions,
  }
}

/**
 * 推送完整的数据集
 * @param data - 要推送的数据
 * @param env - 环境变量
 * @returns 推送是否成功
 */
export async function pushFullDataset(
  data: {
    directory: []
    categories: []
    websites: []
    versions: []
  },
  env: Env
): Promise<boolean> {
  const filesToUpdate = [
    {
      path: FILE_PATHS.DIRECTORY,
      content: JSON.stringify(data.directory, null, 2),
    },
    {
      path: FILE_PATHS.CATEGORIES,
      content: JSON.stringify(data.categories, null, 2),
    },
    {
      path: FILE_PATHS.WEBSITES,
      content: JSON.stringify(data.websites, null, 2),
    },
    {
      path: FILE_PATHS.VERSIONS,
      content: JSON.stringify(data.versions, null, 2),
    },
  ]

  return await updateMultipleFiles(filesToUpdate, 'Update website data via API', env)
}

/**
 * 获取全部版本
 * @return 返回全部的版本列表
 */
export async function getAllVersions(env: Env): Promise<Array<object>> {
  const versionsContent = await getFileContent(FILE_PATHS.VERSIONS, env)
  const versions = versionsContent ? JSON.parse(versionsContent) : []
  return versions
}

/**
 * 获取最新版本
 * @return 返回最新版本信息
 */
export async function getLatestVersion(env: Env): Promise<Array<object>> {
  const versionsContent = await getFileContent(FILE_PATHS.VERSIONS, env)
  const versions = versionsContent ? JSON.parse(versionsContent) : []
  return versions[0] || {}
}

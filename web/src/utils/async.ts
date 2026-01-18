/**
 * 异步工具函数
 */

/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param limit 时间限制（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 延迟执行
 * @param ms 毫秒数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 带超时的 Promise
 * @param promise 原始 Promise
 * @param ms 超时时间（毫秒）
 * @param errorMessage 超时错误消息
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage = '操作超时'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms)
  })
  return Promise.race([promise, timeout])
}

/**
 * 重试执行
 * @param fn 要执行的异步函数
 * @param maxRetries 最大重试次数
 * @param delay 重试间隔（毫秒）
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries) {
        await sleep(delay * (i + 1)) // 指数退避
      }
    }
  }

  throw lastError
}

/**
 * 可取消的 Promise
 */
export interface CancellablePromise<T> extends Promise<T> {
  cancel: () => void
}

export function makeCancellable<T>(promise: Promise<T>): CancellablePromise<T> {
  let isCancelled = false

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise
      .then((val) => {
        if (!isCancelled) {
          resolve(val)
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          reject(error)
        }
      })
  }) as CancellablePromise<T>

  wrappedPromise.cancel = () => {
    isCancelled = true
  }

  return wrappedPromise
}

/**
 * 并发限制的批量执行
 * @param tasks 任务列表
 * @param concurrency 并发数
 */
export async function parallelLimit<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = []
  const executing: Promise<void>[] = []

  for (const task of tasks) {
    const p = task().then((result) => {
      results.push(result)
    })

    executing.push(p as unknown as Promise<void>)

    if (executing.length >= concurrency) {
      await Promise.race(executing)
      executing.splice(
        executing.findIndex((p) => p === undefined),
        1
      )
    }
  }

  await Promise.all(executing)
  return results
}

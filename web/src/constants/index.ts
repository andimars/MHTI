/**
 * 应用常量定义
 *
 * 集中管理所有常量，避免魔法字符串
 */

// =============================================================================
// 存储键名
// =============================================================================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  SESSION_ID: 'session_id',
  EXPIRES_AT: 'expires_at',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  LOCALE: 'locale',
} as const

// =============================================================================
// 路由名称
// =============================================================================

export const ROUTE_NAMES = {
  LOGIN: 'login',
  HOME: 'home',
  SCAN: 'scan',
  HISTORY: 'history',
  HISTORY_DETAIL: 'history-detail',
  FILES: 'files',
  FILE_SCAN: 'file-scan',
  SETTINGS: 'settings',
  SECURITY: 'security',
  WATCHER: 'watcher',
  SCHEDULER: 'scheduler',
} as const

// =============================================================================
// API 路径
// =============================================================================

export const API_PATHS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    STATUS: '/auth/status',
    SESSIONS: '/auth/sessions',
    HISTORY: '/auth/history',
  },
  FILES: {
    SCAN: '/files/scan',
    BROWSE: '/files/browse',
  },
  SCRAPER: {
    STATUS: '/scraper/status',
    SCRAPE: '/scraper/scrape',
    SCRAPE_BY_ID: '/scraper/scrape-by-id',
  },
  CONFIG: {
    TMDB: '/config/tmdb',
    PROXY: '/config/proxy',
    LANGUAGE: '/config/language',
    DOWNLOAD: '/config/download',
    NFO: '/config/nfo',
    ORGANIZE: '/config/organize',
    SYSTEM: '/config/system',
    NAMING: '/config/naming',
  },
} as const

// =============================================================================
// 文件相关
// =============================================================================

export const FILE_CONSTANTS = {
  /** 视频文件扩展名 */
  VIDEO_EXTENSIONS: [
    'mp4',
    'mkv',
    'avi',
    'mov',
    'wmv',
    'flv',
    'webm',
    'm4v',
    'ts',
    'rmvb',
    'rm',
    '3gp',
    'mpg',
    'mpeg',
    'vob',
    'iso',
  ],

  /** 图片文件扩展名 */
  IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],

  /** 字幕文件扩展名 */
  SUBTITLE_EXTENSIONS: ['srt', 'ass', 'ssa', 'sub', 'vtt'],

  /** 默认最小文件大小 (MB) */
  DEFAULT_MIN_SIZE_MB: 100,

  /** 默认文件类型白名单 */
  DEFAULT_WHITELIST: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'ts', 'rmvb'],
} as const

// =============================================================================
// 刮削相关
// =============================================================================

export const SCRAPER_CONSTANTS = {
  /** 链接模式 */
  LINK_MODE: {
    HARDLINK: 1,
    MOVE: 2,
    COPY: 3,
    SYMLINK: 4,
  },

  /** 链接模式名称 */
  LINK_MODE_NAMES: {
    1: '硬链接',
    2: '移动',
    3: '复制',
    4: '符号链接',
  },

  /** 图片质量选项 */
  IMAGE_QUALITY: ['original', 'w1280', 'w780', 'w500', 'w300'],

  /** 刮削状态 */
  STATUS: {
    IDLE: 'idle',
    RUNNING: 'running',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
} as const

// =============================================================================
// 任务相关
// =============================================================================

export const TASK_CONSTANTS = {
  /** 任务来源 */
  SOURCE: {
    MANUAL: 'manual',
    WATCHER: 'watcher',
    SCHEDULER: 'scheduler',
  },

  /** 任务状态 */
  STATUS: {
    PENDING: 'pending',
    RUNNING: 'running',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    SKIPPED: 'skipped',
    PENDING_ACTION: 'pending_action',
  },

  /** 冲突类型 */
  CONFLICT_TYPE: {
    NEED_SELECTION: 'need_selection',
    NEED_SEASON_EPISODE: 'need_season_episode',
    FILE_CONFLICT: 'file_conflict',
    NO_MATCH: 'no_match',
    SEARCH_FAILED: 'search_failed',
    API_FAILED: 'api_failed',
    EMBY_CONFLICT: 'emby_conflict',
  },
} as const

// =============================================================================
// UI 相关
// =============================================================================

export const UI_CONSTANTS = {
  /** 分页默认值 */
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },

  /** 动画时长 (ms) */
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },

  /** 防抖延迟 (ms) */
  DEBOUNCE: {
    SEARCH: 300,
    INPUT: 500,
    RESIZE: 150,
  },

  /** 消息显示时长 (ms) */
  MESSAGE_DURATION: {
    SUCCESS: 3000,
    WARNING: 5000,
    ERROR: 5000,
  },
} as const

// =============================================================================
// 正则表达式
// =============================================================================

export const REGEX = {
  /** 剧集匹配 - S01E01 格式 */
  EPISODE_SE: /S(\d{1,2})E(\d{1,3})/i,

  /** 剧集匹配 - 第X季第X集格式 */
  EPISODE_CN: /第(\d+)季.*第(\d+)集/,

  /** 年份匹配 */
  YEAR: /\((\d{4})\)|\[(\d{4})\]|\.(\d{4})\./,

  /** 分辨率匹配 */
  RESOLUTION: /\b(4K|2160p|1080p|720p|480p)\b/i,

  /** 视频编码匹配 */
  VIDEO_CODEC: /\b(H\.?265|HEVC|H\.?264|AVC|x264|x265)\b/i,

  /** 音频编码匹配 */
  AUDIO_CODEC: /\b(DTS-HD|DTS|AC3|AAC|FLAC|TrueHD|Atmos)\b/i,
} as const

// =============================================================================
// 类型导出
// =============================================================================

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]
export type LinkMode = (typeof SCRAPER_CONSTANTS.LINK_MODE)[keyof typeof SCRAPER_CONSTANTS.LINK_MODE]
export type TaskSource = (typeof TASK_CONSTANTS.SOURCE)[keyof typeof TASK_CONSTANTS.SOURCE]
export type TaskStatus = (typeof TASK_CONSTANTS.STATUS)[keyof typeof TASK_CONSTANTS.STATUS]

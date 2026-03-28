import { useState, useCallback, useRef, useEffect } from 'react'
import Editor, { type Monaco } from '@monaco-editor/react'
import { Braces, Minimize2, Quote, Trash2, Copy, Undo2, GripHorizontal, ArrowUp, Zap, Sun, Moon } from 'lucide-react'
import { Toaster, toast } from 'sonner'

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [topHeight, setTopHeight] = useState(() => {
    const saved = localStorage.getItem('splitterRatio')
    return saved ? parseFloat(saved) : 50
  })
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? saved === 'true' : false
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleEditorBeforeMount = (monaco: Monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: false,
      schemaValidation: 'ignore',
      allowComments: true,
      trailingCommas: 'ignore',
    })
  }

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
    } catch {
      toast.error('JSON 格式错误')
    }
  }

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
    } catch {
      toast.error('JSON 格式错误')
    }
  }

  const handleEscape = () => {
    try {
      const parsed = JSON.parse(input)
      const jsonStr = JSON.stringify(parsed)
      // 只需转义 \ 和 "，JSON.stringify 已处理其他特殊字符
      const escaped = jsonStr
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
      setOutput(escaped)
    } catch {
      toast.error('JSON 格式错误')
    }
  }

  const handleUnescape = () => {
    try {
      let str = input.trim()
      // 如果有外层引号，去掉
      if (str.startsWith('"') && str.endsWith('"')) {
        str = str.slice(1, -1)
      }
      // 反转义：\" 变成 "，\\ 变成 \
      const unescaped = str
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
      const parsed = JSON.parse(unescaped)
      setOutput(JSON.stringify(parsed, null, 2))
    } catch {
      toast.error('无法解析转义字符串')
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
  }

  const handleEscapeMinify = () => {
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      const escaped = minified
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
      setOutput(escaped)
    } catch {
      toast.error('JSON 格式错误')
    }
  }

  const handleMoveToInput = () => {
    if (!output) {
      toast.error('输出框为空')
      return
    }
    setInput(output)
    setOutput('')
  }

  const handleCopyInput = async () => {
    if (!input) {
      toast.error('输入框为空')
      return
    }
    try {
      await navigator.clipboard.writeText(input)
      toast.success('已复制输入内容')
    } catch {
      toast.error('复制失败')
    }
  }

  const handleCopyOutput = async () => {
    if (!output) {
      toast.error('输出框为空')
      return
    }
    try {
      await navigator.clipboard.writeText(output)
      toast.success('已复制输出内容')
    } catch {
      toast.error('复制失败')
    }
  }

  const handleMouseDown = useCallback(() => {
    isDragging.current = true
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const headerHeight = 56
    const toolbarHeight = 60
    const availableHeight = containerRect.height - headerHeight - toolbarHeight
    const mouseY = e.clientY - containerRect.top
    const newTopHeight = ((mouseY - headerHeight - toolbarHeight / 2) / availableHeight) * 100
    const clampedHeight = Math.min(Math.max(newTopHeight, 15), 85)
    setTopHeight(clampedHeight)
    localStorage.setItem('splitterRatio', clampedHeight.toString())
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('darkMode', newMode.toString())
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div ref={containerRef} className={`h-[100dvh] flex flex-col transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <div className={`h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-7 h-7">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ff8a00', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#e52e71', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <g fill="url(#grad1)">
                <circle cx="48" cy="14" r="8" />
                <path d="M48 22v16c0 8.8-7.2 16-16 16H16c-4.4 0-8-3.6-8-8s3.6-8 8-8h12c2.2 0 4-1.8 4-4v-8h-8v-6h12z" />
                <circle cx="16" cy="46" r="6" />
              </g>
            </svg>
          </div>
          <h1 className={`text-lg md:text-xl font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            JSON Tools
          </h1>
        </div>
        <button
          onClick={toggleDarkMode}
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
          title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Input Area */}
      <div style={{ height: `calc(${topHeight}% - 45px)` }} className="p-2 md:p-4 pb-1 md:pb-2 relative">
        <div className={`w-full h-full border rounded-lg overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={input}
            onChange={(value) => setInput(value || '')}
            beforeMount={handleEditorBeforeMount}
            theme={isDarkMode ? 'vs-dark' : 'vs'}
            loading=""
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'off',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              renderLineHighlight: 'none',
              renderLineHighlightOnlyWhenFocus: true,
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
            }}
          />
        </div>
        <button
          onClick={handleCopyInput}
          className={`absolute top-4 md:top-6 right-4 md:right-6 flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 border rounded-md transition-colors z-10 shadow-sm ${
            isDarkMode
              ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-200'
              : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-600'
          }`}
          title="复制输入"
        >
          <Copy size={12} className="md:w-[14px] md:h-[14px]" />
          <span className="text-xs md:text-sm">复制</span>
        </button>
      </div>

      {/* Toolbar with drag handle */}
      <div className={`min-h-[60px] md:h-[60px] flex items-center justify-center gap-2 md:gap-3 px-2 md:px-4 py-2 md:py-0 relative flex-wrap transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 left-0 right-0 h-2 cursor-row-resize hidden md:flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          <GripHorizontal size={16} className="text-gray-400" />
        </div>
        <button
          onClick={handleFormat}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none text-sm md:text-base"
          title="格式化"
        >
          <Braces size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="hidden sm:inline">格式化</span>
        </button>
        <button
          onClick={handleMinify}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:outline-none text-sm md:text-base"
          title="压缩"
        >
          <Minimize2 size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="hidden sm:inline">压缩</span>
        </button>
        <button
          onClick={handleEscape}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors focus:outline-none text-sm md:text-base"
          title="转义"
        >
          <Quote size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="hidden sm:inline">转义</span>
        </button>
        <button
          onClick={handleUnescape}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none text-sm md:text-base"
          title="反转义"
        >
          <Undo2 size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="hidden sm:inline">反转义</span>
        </button>
        <button
          onClick={handleEscapeMinify}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors focus:outline-none text-sm md:text-base"
          title="压缩转义"
        >
          <Zap size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="hidden sm:inline">压缩转义</span>
        </button>
        <button
          onClick={handleMoveToInput}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors focus:outline-none text-sm md:text-base"
          title="移至输入"
        >
          <ArrowUp size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="hidden sm:inline">移至输入</span>
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none text-sm md:text-base"
          title="清空"
        >
          <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="hidden sm:inline">清空</span>
        </button>
      </div>

      {/* Output Area */}
      <div style={{ height: `calc(${100 - topHeight}% - 45px)` }} className="p-2 md:p-4 pt-1 md:pt-2 relative">
        <div className={`w-full h-full border rounded-lg overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={output}
            theme={isDarkMode ? 'vs-dark' : 'vs'}
            loading=""
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'off',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              readOnly: true,
              wordWrap: 'off',
              renderLineHighlight: 'none',
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
            }}
          />
        </div>
        <button
          onClick={handleCopyOutput}
          className={`absolute top-3 md:top-4 right-4 md:right-6 flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 border rounded-md transition-colors z-10 shadow-sm ${
            isDarkMode
              ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-200'
              : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-600'
          }`}
          title="复制输出"
        >
          <Copy size={12} className="md:w-[14px] md:h-[14px]" />
          <span className="text-xs md:text-sm">复制</span>
        </button>
      </div>

      <Toaster
        position="top-right"
        richColors
        closeButton
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </div>
  )
}

export default App

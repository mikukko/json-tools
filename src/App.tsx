import { useState, useCallback, useRef, useEffect } from 'react'
import Editor, { type Monaco } from '@monaco-editor/react'
import { Braces, Minimize2, Quote, Trash2, Copy, Undo2, GripHorizontal, ArrowUp, Zap } from 'lucide-react'
import { toast } from 'sonner'

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [topHeight, setTopHeight] = useState(60)
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
    toast.success('已移至输入框')
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
    const toolbarHeight = 60
    const availableHeight = containerRect.height - toolbarHeight
    const mouseY = e.clientY - containerRect.top
    const newTopHeight = ((mouseY - toolbarHeight / 2) / availableHeight) * 100
    setTopHeight(Math.min(Math.max(newTopHeight, 15), 85))
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div ref={containerRef} className="h-screen flex flex-col bg-gray-100">
      {/* Input Area */}
      <div style={{ height: `calc(${topHeight}% - 30px)` }} className="p-4 pb-2 relative">
        <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <Editor
            height="100%"
            defaultLanguage="json"
            value={input}
            onChange={(value) => setInput(value || '')}
            beforeMount={handleEditorBeforeMount}
            theme="vs"
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
                vertical: 'hidden',
                horizontal: 'hidden',
                verticalScrollbarSize: 0,
                horizontalScrollbarSize: 0,
              },
            }}
          />
        </div>
        <button
          onClick={handleCopyInput}
          className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-md transition-colors z-10 shadow-sm"
          title="复制输入"
        >
          <Copy size={14} className="text-gray-600" />
          <span className="text-sm text-gray-600">复制</span>
        </button>
      </div>

      {/* Toolbar with drag handle */}
      <div className="h-[60px] bg-gray-200 flex items-center justify-center gap-3 px-4 relative">
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 left-0 right-0 h-2 cursor-row-resize flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          <GripHorizontal size={16} className="text-gray-400" />
        </div>
        <button
          onClick={handleFormat}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Braces size={18} />
          <span>格式化</span>
        </button>
        <button
          onClick={handleMinify}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <Minimize2 size={18} />
          <span>压缩</span>
        </button>
        <button
          onClick={handleEscape}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <Quote size={18} />
          <span>转义</span>
        </button>
        <button
          onClick={handleUnescape}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          <Undo2 size={18} />
          <span>反转义</span>
        </button>
        <button
          onClick={handleEscapeMinify}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Zap size={18} />
          <span>压缩转义</span>
        </button>
        <button
          onClick={handleMoveToInput}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
        >
          <ArrowUp size={18} />
          <span>移至输入</span>
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <Trash2 size={18} />
          <span>清空</span>
        </button>
      </div>

      {/* Output Area */}
      <div style={{ height: `calc(${100 - topHeight}% - 30px)` }} className="p-4 pt-2 relative">
        <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <Editor
            height="100%"
            defaultLanguage="json"
            value={output}
            theme="vs"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'off',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              readOnly: true,
              renderLineHighlight: 'none',
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden',
                verticalScrollbarSize: 0,
                horizontalScrollbarSize: 0,
              },
            }}
          />
        </div>
        <button
          onClick={handleCopyOutput}
          className="absolute top-4 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-md transition-colors z-10 shadow-sm"
          title="复制输出"
        >
          <Copy size={14} className="text-gray-600" />
          <span className="text-sm text-gray-600">复制</span>
        </button>
      </div>
    </div>
  )
}

export default App

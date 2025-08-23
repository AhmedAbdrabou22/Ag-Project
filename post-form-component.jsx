'use client'

import { useFormState } from 'react-dom'
import { createPost } from './advanced-server-actions.js'

const initialState = {
  error: null,
  success: false
}

export default function PostForm() {
  const [state, formAction] = useFormState(createPost, initialState)

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-right">إنشاء منشور جديد</h2>
      
      {/* عرض رسائل الخطأ */}
      {state?.error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded text-right">
          {state.error}
        </div>
      )}
      
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 text-right">
            عنوان المنشور
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل عنوان المنشور"
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 text-right">
            محتوى المنشور
          </label>
          <textarea
            id="content"
            name="content"
            rows={6}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="اكتب محتوى المنشور هنا..."
          />
        </div>
        
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          نشر المقال
        </button>
      </form>
    </div>
  )
}
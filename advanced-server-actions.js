'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Server Action مع التحقق من البيانات
export async function createPost(prevState, formData) {
  const title = formData.get('title')
  const content = formData.get('content')
  
  // التحقق من صحة البيانات
  if (!title || title.trim().length < 3) {
    return {
      error: 'العنوان يجب أن يكون 3 أحرف على الأقل',
      success: false
    }
  }
  
  if (!content || content.trim().length < 10) {
    return {
      error: 'المحتوى يجب أن يكون 10 أحرف على الأقل',
      success: false
    }
  }
  
  try {
    // محاكاة حفظ في قاعدة البيانات
    console.log('حفظ المنشور:', { title, content })
    
    // في التطبيق الحقيقي:
    // const post = await db.posts.create({ title, content })
    
    // تحديث الكاش وإعادة التحقق من المسار
    revalidatePath('/posts')
    
    // إعادة التوجيه إلى صفحة المنشورات
    redirect('/posts')
    
  } catch (error) {
    return {
      error: 'حدث خطأ أثناء حفظ المنشور',
      success: false
    }
  }
}

// Server Action للحذف
export async function deletePost(postId) {
  try {
    // محاكاة حذف من قاعدة البيانات
    console.log('حذف المنشور:', postId)
    
    // في التطبيق الحقيقي:
    // await db.posts.delete({ where: { id: postId } })
    
    // تحديث الكاش
    revalidatePath('/posts')
    
    return { success: true, message: 'تم حذف المنشور بنجاح' }
  } catch (error) {
    return { success: false, error: 'فشل في حذف المنشور' }
  }
}

// Server Action مع رفع الملفات
export async function uploadImage(formData) {
  const file = formData.get('image')
  
  if (!file) {
    return { error: 'يرجى اختيار صورة' }
  }
  
  // التحقق من نوع الملف
  if (!file.type.startsWith('image/')) {
    return { error: 'يرجى اختيار ملف صورة صحيح' }
  }
  
  // التحقق من حجم الملف (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    return { error: 'حجم الصورة يجب أن يكون أقل من 2 ميجابايت' }
  }
  
  try {
    // محاكاة رفع الصورة
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // في التطبيق الحقيقي، ستقوم برفع الصورة إلى الخادم أو التخزين السحابي
    console.log('رفع صورة بحجم:', buffer.length, 'بايت')
    
    return { success: true, message: 'تم رفع الصورة بنجاح' }
  } catch (error) {
    return { error: 'فشل في رفع الصورة' }
  }
}
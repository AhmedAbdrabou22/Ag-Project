// مثال بسيط على Server Action
'use server'

// هذه دالة Server Action - تعمل على الخادم فقط
async function createUser(formData) {
  // الحصول على البيانات من النموذج
  const name = formData.get('name')
  const email = formData.get('email')
  
  // محاكاة حفظ البيانات في قاعدة البيانات
  console.log('حفظ المستخدم:', { name, email })
  
  // يمكنك هنا إضافة كود قاعدة البيانات الفعلي
  // await db.users.create({ name, email })
  
  // إعادة توجيه أو إرجاع نتيجة
  return { success: true, message: 'تم إنشاء المستخدم بنجاح!' }
}

export { createUser }
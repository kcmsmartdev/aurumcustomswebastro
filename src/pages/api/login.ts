import type { APIRoute } from 'astro'
import { createClient } from '@supabase/supabase-js'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL!,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return new Response('Credenciales incorrectas', { status: 401 })
  }

  // Guardar sesión en cookie
  cookies.set('sb-access-token', data.session.access_token, {
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'strict'
  })

  return redirect('/dashboard')
}
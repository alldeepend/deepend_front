import LoginForm from '../LoginForm'

const C = { bg: '#231F20' }

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: C.bg }}>
      <LoginForm />
    </div>
  )
}

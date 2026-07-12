import LoginForm from '../LoginForm'
import { C } from '../../styles/colors'

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: C.bg }}>
      <LoginForm />
    </div>
  )
}

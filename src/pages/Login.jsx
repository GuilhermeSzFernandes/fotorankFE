import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
// axios.defaults já configurado em AuthContext

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', form);
      login(data.user);
      if (data.user.role === 'teacher') navigate('/teacher');
      else if (data.user.role === 'admin') navigate('/admin');
      else navigate('/upload');
    } catch (err) {
      setError(err.response?.data?.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4">
      <div className="w-full max-w-xs">

        <div className="mb-10 enter-1">
          <p className="text-2xs text-ink-muted uppercase tracking-widest mb-4">Acesso</p>
          <h1 className="font-display text-5xl italic text-ink leading-none mb-3" style={{ letterSpacing: '-0.02em' }}>
            Entrar
          </h1>
          <p className="text-xs text-ink-secondary">Acesse sua conta para continuar.</p>
        </div>

        {error && (
          <div className="enter-2 text-red-400/80 text-xs mb-5 px-3 py-2.5 border border-red-900/30 rounded-sm bg-red-900/5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 enter-2">
          <div>
            <label className="flabel">E-mail</label>
            <input type="email" className="field" placeholder="seu@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoFocus required />
          </div>
          <div>
            <label className="flabel">Senha</label>
            <input type="password" className="field" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <div className="text-right mt-1.5">
              <Link to="/forgot-password" className="text-2xs text-ink-muted hover:text-ink-secondary transition-colors">
                Esqueci a senha
              </Link>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-ink-muted mt-8 enter-3">
          Sem conta?{' '}
          <Link to="/register" className="text-ink-secondary hover:text-ink underline underline-offset-4 decoration-line-strong transition-colors">
            Criar agora
          </Link>
        </p>

        <div className="mt-10 pt-6 border-t border-line enter-4">
          <p className="text-2xs text-ink-muted uppercase mb-3">Demonstração</p>
          <div className="space-y-1.5 font-mono text-2xs text-ink-muted/60">
            <p>admin@fotorank.com · admin123</p>
            <p>ana@fotorank.com · prof123</p>
          </div>
        </div>

      </div>
    </div>
  );
}

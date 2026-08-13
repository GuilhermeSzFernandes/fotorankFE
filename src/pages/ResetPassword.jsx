import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenEmail, setTokenEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) { setValidating(false); return; }
    axios
      .get(`/api/auth/reset-password/validate?token=${token}`)
      .then(({ data }) => {
        setTokenEmail(data.email);
      })
      .catch(() => setError('Token inválido ou expirado.'))
      .finally(() => setValidating(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('As senhas não coincidem.');
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, password: form.password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] text-ink-muted text-xs font-mono">
        validando token…
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-xs text-center enter-1">
          <p className="font-display text-5xl italic text-ink mb-4" style={{ letterSpacing: '-0.02em' }}>
            Senha redefinida
          </p>
          <p className="text-xs text-ink-secondary mb-8">
            Sua senha foi alterada com sucesso. Você já pode entrar.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary w-full">
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  if (error && !form.password) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-xs text-center enter-1">
          <p className="font-display text-4xl italic text-ink mb-4" style={{ letterSpacing: '-0.02em' }}>
            Link inválido
          </p>
          <p className="text-xs text-ink-secondary mb-8">{error}</p>
          <Link to="/forgot-password" className="btn-primary inline-block">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="mb-10 enter-1">
          <p className="text-2xs text-ink-muted uppercase tracking-widest mb-4">Recuperação</p>
          <h1 className="font-display text-5xl italic text-ink leading-none mb-3" style={{ letterSpacing: '-0.02em' }}>
            Nova senha
          </h1>
          {tokenEmail && (
            <p className="text-xs text-ink-secondary">
              Conta: <span className="font-mono text-ink-muted">{tokenEmail}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="enter-2 text-danger text-xs mb-5 px-3 py-2.5 border border-danger-border rounded-sm bg-danger-bg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 enter-2">
          <div>
            <label className="flabel">Nova senha</label>
            <input
              type="password"
              className="field"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="flabel">Confirmar nova senha</label>
            <input
              type="password"
              className="field"
              placeholder="Repita a senha"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Salvando…' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
